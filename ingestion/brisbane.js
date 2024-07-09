import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const path = join(import.meta.dirname, "..", "data", "brisbane.json");

const fileContents = await readFile(path, { encoding: "utf-8" });
const data = JSON.parse(fileContents);

const newData = data.sessions
  .filter((session) => !session.isServiceSession)
  .map((session) => {
    const speakers = session.speakers.map((speakerId) => {
      const speaker = data.speakers.find((speaker) => speaker.id === speakerId);
      return `${speaker.firstName} ${speaker.lastName}`;
    });
    const talk = `${session.title} by ${speakers.join(", ")}
    ${session.description}`;
    return {
      talk,
      startsAt: session.startsAt,
    };
  });

const newPath = join(
  import.meta.dirname,
  "..",
  "data",
  "brisbane-cleaned.json"
);
await writeFile(newPath, JSON.stringify(newData, null, 2));
