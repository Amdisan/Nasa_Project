const express = require("express");

const helmet = require("helmet");

const cors = require("cors");

const path = require("path");

const morgan = require("morgan");

const apiV1 = require("./routes/api_v1");

const app = express();

app.use(morgan("combined"));

app.use(helmet());

app.use(
  cors({
    origin: "https://localhost:3000",
  })
);

app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));

app.use("/v1", apiV1);

app.use("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

module.exports = app;
