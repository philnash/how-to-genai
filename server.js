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
  const bot = createBot("", messages);
  const { query } = req.body;
  model.countTokens(query).then((result) => console.log(result));
  const result = await bot.sendMessage(query);

  const response = await result.response;
  const text = response.text();
  messages.push({ role: "user", parts: [{ text: query }] });
  messages.push({ role: "model", parts: [{ text }] });
  req.session.messages = messages;
  res.send(text);
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
