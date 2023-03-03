const https = require("node:https");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const { mongoConnect } = require("./services/mongo");

const { loadPlanetsData } = require("./models/planets.model");

const { loadLaunchData } = require("./models/launches.model");

const app = require("./app");

const PORT = process.env.PORT || 8000;

(async function startServer() {
  await mongoConnect();
  await loadPlanetsData();
  await loadLaunchData();
  const server = https.createServer(
    {
      key: fs.readFileSync(path.join(__dirname, "cert", "key.pem")),
      cert: fs.readFileSync(path.join(__dirname, "cert", "cert.pem")),
    },
    app
  );

  server.listen(PORT, () => {
    console.log(`server is on the port ${PORT}`);
  });
})();
