import { env } from "node:process";
import { DataAPIClient } from "@datastax/astra-db-ts";

const { ASTRA_DB_ENDPOINT, ASTRA_DB_TOKEN } = env;

export const client = new DataAPIClient(ASTRA_DB_TOKEN);
export const db = client.db(ASTRA_DB_ENDPOINT);
export const collection = db.collection("aiengineer");
