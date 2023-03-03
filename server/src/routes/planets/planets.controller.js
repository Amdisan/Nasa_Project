const { getPlanets } = require("../../models/planets.model");

async function httpGetAllPlanets(req, res) {
  const planets = await getPlanets();
  return res.status(200).json(planets);
}

module.exports = { httpGetAllPlanets };
