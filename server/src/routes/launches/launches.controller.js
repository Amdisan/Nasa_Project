const {
  getLaunches,
  addNewLaunch,
  existsLaunchWithId,
  abortLaunchWithId,
} = require("../../models/launches.model");

const { getPagination } = require("../../services/query");

async function httpGetAllLaunches(req, res) {
  const { skip, limit } = getPagination(req.query);
  const launches = await getLaunches(skip, limit);
  return res.status(200).json(launches);
}

async function httpAddNewLaunch(req, res) {
  try {
    const launch = req.body;
    const { mission, target, rocket } = launch;

    if (!mission || !target || !rocket || !launch.launchDate) {
      return res
        .status(400)
        .json({ error: "Missing required launch property" });
    }

    launch.launchDate = new Date(launch.launchDate);

    if (isNaN(launch.launchDate)) {
      return res.status(400).json({ error: "Wrong Date" });
    }

    await addNewLaunch(launch);

    const launches = await getLaunches();

    return res.status(201).json(launches.at(-1));
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
}

async function httpAbortLaunch(req, res) {
  const id = Number(req.params.id);

  if (!(await existsLaunchWithId(id))) {
    return res.status(404).json({
      error: "Launch not found",
    });
  }

  const aborted = await abortLaunchWithId(id);
  if (!aborted) {
    return res.status(400).json({ error: "Launch not aborted" });
  }
  return res.status(200).json({ ok: true });
}

module.exports = { httpGetAllLaunches, httpAddNewLaunch, httpAbortLaunch };
