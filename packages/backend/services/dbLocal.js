/**
 * LOCAL DATABASE
 *
 *  - Users are stored in an object structure, with keys being users' addresses, and values being users' data.
 *  - Events are stored in an array structure. Each item in the array is the event's data.
 */
require("dotenv").config();
const fs = require("fs");
const { getProp } = require("../utils/object");

console.log("using local db");

const DATABASE_PATH =
  process.env.NODE_ENV === "test" ? "./local_database/__testing__local_db.json" : "./local_database/local_db.json";
const SEED_PATH = "./local_database/seed.json";
const databaseSeed = JSON.parse(fs.readFileSync(SEED_PATH, "utf8"));

if (!fs.existsSync(DATABASE_PATH)) {
  // Seed the local database if empty.
  fs.copyFileSync(SEED_PATH, DATABASE_PATH, fs.constants.COPYFILE_EXCL);
}

let database;
database = JSON.parse(fs.readFileSync(DATABASE_PATH, "utf8"));

if (databaseSeed.version !== database.version) {
  console.log("New local db version: overwriting exiting local_db.json file");
  fs.copyFileSync(SEED_PATH, DATABASE_PATH);
  database = JSON.parse(fs.readFileSync(DATABASE_PATH, "utf8"));
}

// --- Utilities
const persist = () => {
  const file = fs.openSync(DATABASE_PATH, "w");
  fs.writeFileSync(file, JSON.stringify(database, null, 2));
  fs.closeSync(file);
};

/**
 * @param {*} conditionsArg
 * @returns an array of functions for every condition which returns true if a
 * given event passes the condition.
 */
const generateLocalDbConditionsFromArgs = conditionsArg => {
  return Object.entries(conditionsArg).map(([paths, values]) => {
    const brokenPaths = paths.split(",").map(path => path.split("/"));
    const valuesArray = values.split(",");
    return testedEvent => {
      return brokenPaths.some(pathArray => valuesArray.some(value => getProp(testedEvent, pathArray) === value));
    };
  });
};

// --- Users
const findUserByAddress = builderAddress => {
  if (!database.users[builderAddress]) {
    return { exists: false };
  }
  return { exists: true, data: { id: builderAddress, ...database.users[builderAddress] } };
};

const createUser = (userId, userData) => {
  database.users[userId] = userData;
  persist();
};

const updateUser = (userId, userData) => {
  const { id, ...existingUserData } = findUserByAddress(userId).data;

  database.users[userId] = {
    ...existingUserData,
    ...userData,
  };

  persist();
};

const findAllUsers = () => {
  return Object.entries(database.users).map(([id, userData]) => ({ id, ...userData }));
};

// --- Events
const createEvent = event => {
  database.events.push(event);

  persist();
};

const findAllEvents = ({ limit: limitArg } = {}) => {
  const limit = limitArg ?? database.events.length;
  return database.events.slice(limit * -1);
};

const findEventsWhere = ({ conditions: conditionsArg, limit } = {}) => {
  const allEvents = findAllEvents({ limit });

  const conditions = generateLocalDbConditionsFromArgs(conditionsArg);

  return allEvents.filter(event => conditions.every(condition => condition(event)));
};

const createBuild = build => {
  database.builds.push(build);

  persist();
};

const findAllBuilds = (isDraft = false) => {
  const allBuilds = database.builds.map((build, index) => ({ id: index, ...build }));
  if (isDraft) {
    return allBuilds.filter(build => build.isDraft);
  }

  return allBuilds;
};

const publishBuild = buildId => {
  const existingBuild = database.builds[buildId];
  delete existingBuild.isDraft;
  database.builds[buildId] = existingBuild;

  persist();
};

const removeBuild = buildId => {
  delete database.builds[buildId];

  persist();
};

module.exports = {
  createUser,
  updateUser,
  findAllUsers,
  findUserByAddress,

  createEvent,
  findAllEvents,
  findEventsWhere,

  createBuild,
  findAllBuilds,
  publishBuild,
  removeBuild,

  __internal_database: database, // testing only
};
