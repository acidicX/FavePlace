import bodyParser from "body-parser";
import express from "express";
import serveStatic from "serve-static";
import favicon from "serve-favicon";
import nocache from "nocache";
import { resolve, join } from "path";
import dotenv from "dotenv-safe";
dotenv.config();

type InjectedConfiguration = {
  mapboxAccessToken: string;
  mapboxMapStyle: string;
  firebaseApiKey: string;
  firebaseAuthDomain: string;
  firebaseDatabaseUrl: string;
  firebaseProjectId: string;
  firebaseStorageBucket: string;
  firebaseMessagingSenderId: string;
  firebaseAppId: string;
};

const injectedConfiguration: InjectedConfiguration = {
  mapboxAccessToken: process.env.MAPBOX_ACCESS_TOKEN,
  mapboxMapStyle: process.env.MAPBOX_MAP_STYLE,
  firebaseApiKey: process.env.FIREBASE_API_KEY,
  firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN,
  firebaseDatabaseUrl: process.env.FIREBASE_DATABASE_URL,
  firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
  firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  firebaseMessagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  firebaseAppId: process.env.FIREBASE_APP_ID,
};

const app = express();

app.set("etag", false);
app.use(nocache());

app.use(bodyParser.json());
app.use(favicon(join(__dirname, "..", "client", "favicon.ico")));
app.use(
  serveStatic(resolve("./client"), {
    cacheControl: false,
  })
);

app.set("view engine", "ejs");
app.get("*", function (_req, res) {
  res.render(resolve("./client/index.ejs"), {
    PUBLIC_URL: process.env.PUBLIC_URL,
    injectedConfiguration: JSON.stringify(injectedConfiguration),
  });
});

app.on("ready", () => {
  const port = "8080";
  app.listen(port, () => {
    console.log(`🚀 Server is ready at port ${port}`);
  });
});

app.emit("ready");
