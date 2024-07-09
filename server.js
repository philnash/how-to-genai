import { join } from "node:path";

import Express from "express";
import session from "express-session";
import sassMiddleware from "express-dart-sass";

import { sessionSecret, port } from "./lib/config.js";
import { defaultMessages } from "./lib/consts.js";
import { createBot } from "./lib/bot.js";

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
    debug: true,
    outputStyle: "compressed",
  })
);
app.use(Express.static("public"));

app.get("/history", (req, res) => {
  const messages = req.session.messages || defaultMessages;
  res.json(messages);
});

app.post("/messages", async (req, res) => {
  const messages = req.session.messages || defaultMessages;
  const bot = createBot(messages);

  const { query } = req.body;
  const newMessage = { role: "user", parts: [{ text: query }] };
  messages.push(newMessage);
  const result = await bot.sendMessageStream(query);
  let text = "";
  for await (const chunk of result.stream) {
    text += chunk.text();
    console.log(text);
  }
  messages.push({ role: "model", parts: [{ text }] });
  req.session.messages = messages;
  res.send(text);
});

app.get("/clear-history", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
