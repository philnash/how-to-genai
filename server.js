import { join } from "node:path";

import Express from "express";
import session from "express-session";
import sassMiddleware from "express-dart-sass";

import { sessionSecret, port } from "./lib/config.js";
import { SYSTEM_MESSAGE } from "./lib/consts.js";
import { createBot, model } from "./lib/bot.js";
import { collection } from "./lib/db.js";

const app = Express();

// Middleware
app.set("trust proxy", 1);
app.use(
  session({
    secret: sessionSecret,
    cookie: { secure: "auto", sameSite: true, httpOnly: true },
    saveUninitialized: true,
    resave: false,
  })
);
app.use(Express.json());
app.use(
  sassMiddleware({
    src: join(import.meta.dirname, "sass"),
    dest: join(import.meta.dirname, "public"),
    debug: false,
    outputStyle: "compressed",
  })
);
app.use(Express.static("public"));

app.get("/history", (req, res) => {
  const messages = req.session.messages || [];
  res.json(messages);
});

app.post("/messages", async (req, res) => {
  const messages = req.session.messages || [];
  const bot = createBot(SYSTEM_MESSAGE, messages);
  const { query } = req.body;
  model.countTokens(query).then((result) => console.log(result));
  const context = await collection
    .find(
      {},
      {
        sort: { $vectorize: query },
        limit: 5,
        projection: { $vectorize: 1 },
        includeSimilarity: true,
      }
    )
    .toArray();

  const mostSimilarContext = context.filter((doc) => doc.$similarity > 0.7);
  let prompt;
  if (mostSimilarContext.length > 0) {
    prompt = `${mostSimilarContext.map((doc) => doc.$vectorize).join("\n")}
  ---
  Given the context above, answer the following questions: ${query}`;
  } else {
    prompt = `Try to answer the following question. If you can't answer it from the conversation so far or your existing knowledge you can say so.
    
    Question: ${query}`;
  }
  const result = await bot.sendMessageStream(prompt);
  let text = "";
  res.set("Content-Type", "text/plain");
  for await (const chunk of result.stream) {
    text += chunk.text();
    res.write(chunk.text());
  }
  messages.push({ role: "user", parts: [{ text: query }] });
  messages.push({ role: "model", parts: [{ text }] });
  req.session.messages = messages;
  res.end();
});

app.get("/clear-history", (req, res) => {
  req.session.regenerate(() => {
    req.session.messages = [];
    res.redirect("/");
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
