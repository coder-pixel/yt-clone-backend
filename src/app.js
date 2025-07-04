import express from "express";
import cors from "cors";

const app = express();

const corsOptions = {
  origin: process.env.CORS_ORIGIN,
  credentials: true,
};
app.use(cors(corsOptions));

// use express.json to parse the body of the request
app.use(
  express.json({
    limit: "15kb", // limit the size of the body to 15kb, that is the maximum size of the body that can be sent to the server
  })
);

// use express.urlencoded to parse the urlencoded data of the request
app.use(
  express.urlencoded({
    extended: true, // extended: true means that the urlencoded data will be parsed as an object
    limit: "15kb", // limit the size of the body to 15kb, that is the maximum size of the body that can be sent to the server
  })
);

app.use(express.static("public"));

app.use(cookieParser());

export default app;
