const { Router } = require("express");
const { httpGetAllPlanets } = require("./planets.controller");

const planetsRouter = Router();

planetsRouter.get("/", async (req, res) => await httpGetAllPlanets(req, res));

module.exports = planetsRouter;
