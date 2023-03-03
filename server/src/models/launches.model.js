const axios = require("axios");

const launches = require("./launches.mongo");
const planets = require("./planets.mongo");

const DEFAULT_FLIGHT_NUMBER = 100;

const SPACEX_API_URL = "https://api.spacexdata.com/v4/launches/query";

async function getLatestFligthNumber() {
  const latestLaunch = await launches.findOne().sort("-flightNumber");
  if (!latestLaunch) {
    return DEFAULT_FLIGHT_NUMBER;
  }
  return latestLaunch.flightNumber;
}

async function getLaunches(skip, limit) {
  return await launches
    .find({}, { "_id": 0, "__v": 0 })
    .sort({ flightNumber: 1 })
    .skip(skip)
    .limit(limit);
}

async function saveLaunch(launch) {
  try {
    await launches.updateOne(
      {
        flightNumber: launch.flightNumber,
      },
      launch,
      { upsert: true }
    );
  } catch (err) {
    throw err;
  }
}

async function addNewLaunch(launch) {
  try {
    const planet = await planets.findOne({
      keplerName: launch.target,
    });

    if (!planet) {
      throw new Error("No matching planet was found");
    }

    const newFlightNumber = (await getLatestFligthNumber()) + 1;
    const newLaunch = {
      ...launch,
      customers: ["NASA", "Amdisan"],
      upcoming: true,
      success: true,
      flightNumber: newFlightNumber,
    };
    await saveLaunch(newLaunch);
  } catch (err) {
    throw err;
  }
}

async function abortLaunchWithId(launchId) {
  const aborted = await launches.updateOne(
    {
      flightNumber: launchId,
    },
    { upcoming: false, success: false }
  );
  return (aborted.acknowledged = true && aborted.modifiedCount === 1);
}

async function loadLaunchData() {
  const firstLaunch = await findLaunch({
    flightNumber: 1,
    rocket: "Falcon 1",
    mission: "FalconSat",
  });

  if (firstLaunch) {
    console.log("launch data already loaded");
    return;
  }
  await populateLaunches();
}

async function findLaunch(filter) {
  return await launches.findOne(filter);
}

async function existsLaunchWithId(launchId) {
  return await findLaunch({
    flightNumber: launchId,
  });
}

async function populateLaunches() {
  const response = await axios.post(SPACEX_API_URL, {
    query: {},
    options: {
      pagination: false,
      populate: [
        {
          path: "rocket",
          select: {
            name: 1,
          },
        },
        {
          path: "payloads",
          select: {
            customers: 1,
          },
        },
      ],
    },
  });
  if (response.status !== 200) {
    console.log("Problem with loading launch data from SpaceX");
    throw new Error("Loading launch data from SpaceX failed");
  }
  const launchData = response.data.docs.map(async (doc) => {
    const customers = doc.payloads.flatMap((payload) => payload.customers);
    const launch = {
      flightNumber: doc.flight_number,
      mission: doc.name,
      rocket: doc.rocket.name,
      launchDate: doc.date_local,
      customers,
      upcoming: doc.upcoming,
      success: doc.success,
    };
    await saveLaunch(launch);
    return launch;
  });
  console.log(`${launchData.length} SpaceX launches found`);
}

module.exports = {
  existsLaunchWithId,
  getLaunches,
  addNewLaunch,
  abortLaunchWithId,
  loadLaunchData,
};
