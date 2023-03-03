const { Router } = require("express");

const {
  httpGetAllLaunches,
  httpAddNewLaunch,
  httpAbortLaunch,
} = require("./launches.controller");

const launchesRouter = Router();

launchesRouter.get("/", async (req, res) => await httpGetAllLaunches(req, res));
launchesRouter.post("/", async (req, res) => await httpAddNewLaunch(req, res));
launchesRouter.delete(
  "/:id",
  async (req, res) => await httpAbortLaunch(req, res)
);

module.exports = launchesRouter;
