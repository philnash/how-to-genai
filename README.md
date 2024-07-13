# How to work with generative AI in JavaScript

This application was the demo shown for [Phil Nash's](https://philna.sh) talk on generative AI in JavaScript.

## Running the app

You will need:

* Node.js
* [A free DataStax Astra DB account](https://dtsx.io/3LhINzg)

Then clone the application:

```sh
git clone https://github.com/philnash/how-to-genai.git
cd how-to-genai
```

Copy the `.env.example` file to `.env`:

```sh
cp .env.example .env
```

### Create a Database

Set up a new database in Astra DB and create a collection. Use the built in NVIDEA embeddings.

Gather the database endpoint, generate a token and enter them both, along with the collection name in your `.env` file.

### Get a Gemini API key

Get an API key for Gemini from the [Google AI Studio](https://ai.google.dev/aistudio). Enter the API key in your `.env` file.

### Install dependencies

Install the dependencies with:

```
npm install
```

### Session key

Generate a random session key and enter that in `.env`.

### Run the app

Run with:

```sh
npm start
```

### The different stages

You can check out the different stages of the app by checking out the different tags:

* 1-generation
* 2-basic-chat
* 3-context
* 4-streaming