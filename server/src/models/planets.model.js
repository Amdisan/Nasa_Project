const { parse } = require("csv-parse");
const path = require("path");
const fs = require("fs");

const planets = require("./planets.mongo");

function isHabitable(planet) {
  return (
    planet.koi_disposition === "CONFIRMED" &&
    planet.koi_insol > 0.36 &&
    planet.koi_insol < 1.11 &&
    planet.koi_prad < 1.6
  );
}

async function loadPlanetsData() {
  return new Promise((resolve, reject) => {
    fs.createReadStream(
      path.join(__dirname, "..", "..", "data", "kepler_data.csv")
    )
      .pipe(
        parse({
          comment: "#",
          columns: true,
        })
      )
      .on("data", async (data) => {
        if (isHabitable(data)) {
          savePlanet(data);
        }
      })
      .on("error", (err) => {
        reject(err);
      })
      .on("end", async () => {
        console.log(`${(await getPlanets()).length} planets found`);
        resolve();
      });
  });
}

async function getPlanets() {
  try {
    return await planets.find(
      {},
      {
        "__v": 0,
        "_id": 0,
      }
    );
  } catch (err) {
    throw new Error(`Could not find planets ${err}`);
  }
}

async function savePlanet(planet) {
  try {
    return await planets.updateOne(
      { keplerName: planet.kepler_name },
      { keplerName: planet.kepler_name },
      { upsert: true }
    );
  } catch (err) {
    throw new Error(`Could not save planet ${err}`);
  }
}

module.exports = {
  loadPlanetsData,
  getPlanets,
};
