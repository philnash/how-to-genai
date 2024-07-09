const SCROLL_OPTIONS = {
  block: "end",
  inline: "nearest",
  behavior: "smooth",
};

function buildMessage(message) {
  const li = document.createElement("li");
  li.classList.add(message.role);
  const article = document.createElement("article");
  for (const part of message.parts) {
    const p = document.createElement("p");
    p.textContent = part.text;
    article.appendChild(p);
  }
  li.appendChild(article);
  return li;
}

function appendMessage(message) {
  console.log(message);
  const messages = document.querySelector(".chat");
  const newMessage = buildMessage(message);
  messages.appendChild(newMessage);
  newMessage.scrollIntoView(SCROLL_OPTIONS);
  return newMessage;
}

async function sendMessage(event) {
  event.preventDefault();
  const form = event.target;
  const input = form.querySelector("#query");
  const body = { query: input.value };
  appendMessage({ role: "user", parts: [{ text: input.value }] });
  input.value = "";
  const response = await fetch("/messages", {
    method: form.getAttribute("method"),
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const li = appendMessage({ role: "model", parts: [{ text: "" }] });
  const article = li.querySelector("article");
  const decoder = new TextDecoder();
  for await (const chunk of response.body) {
    article.textContent += decoder.decode(chunk);
  }
  li.scrollIntoView(SCROLL_OPTIONS);
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  form.addEventListener("submit", sendMessage);
  fetch("/history")
    .then((response) => response.json())
    .then((messages) => {
      messages = messages.slice(2);
      messages.forEach((message) => {
        appendMessage(message);
      });
    });
});
