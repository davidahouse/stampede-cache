"use strict";
const asyncRedis = require("async-redis");

let client;

// Public functions

// General

/**
 * startCache
 * @param {*} conf
 */
function startCache(conf) {
  client = createRedisClient(conf);
  client.on("error", function(err) {
    console.log("redis connect error: " + err);
  });
}

// Tasks

/**
 * fetchTasks
 */
async function fetchTasks() {
  const tasks = await fetchMembers("stampede-tasks");
  return tasks;
}

/**
 * fetchTaskConfig
 * @param {*} id
 * @return {Object} task config
 */
async function fetchTaskConfig(id) {
  const config = await fetch("stampede-tasks-" + id);
  return config;
}

/**
 * removeTaskConfig
 */
async function removeTaskConfig() {
  const tasks = await fetchMembers("stampede-tasks");
  for (let index = 0; index < tasks.length; index++) {
    remove("stampede-" + tasks[index]);
  }
  await remove("stampede-tasks");
}

/**
 * storeTask
 * @param {*} id
 */
async function storeTask(id) {
  await add("stampede-tasks", id);
}

/**
 * storeTaskConfig
 * @param {*} id
 * @param {*} config
 */
async function storeTaskConfig(id, config) {
  await store("stampede-tasks-" + id, config);
}

// Repo Config

/**
 * fetchRepoConfig
 * @param {*} owner
 * @param {*} repo
 * @return {Object} config
 */
async function fetchRepoConfig(owner, repo) {
  const config = await fetch("stampede-" + owner + "-" + repo + "-config");
  return config;
}

/**
 * storeRepoConfig
 * @param {*} owner
 * @param {*} repo
 * @param {*} config
 */
async function storeRepoConfig(owner, repo, config) {
  await store("stampede-" + owner + "-" + repo + "-config", config);
}

/**
 * removeRepoConfig
 * @param {*} owner
 * @param {*} repo
 */
async function removeRepoConfig(owner, repo) {
  await remove("stampede-" + owner + "-" + repo + "-config");
}

// System level config

/**
 * storeSystemQueues
 * @param {*} queues
 */
async function storeSystemQueues(queues) {
  await store("stampede-config-queues", queues);
}

/**
 * fetchSystemQueues
 * @return {*} queues
 */
async function fetchSystemQueues() {
  const queues = await fetch("stampede-config-queues");
  return queues;
}

/**
 * storeSystemDefaults
 * @param {*} defaults
 */
async function storeSystemDefaults(defaults) {
  await store("stampede-config-defaults", defaults);
}

/**
 * fetchSystemDefaults
 * @return {*} defaults
 */
async function fetchSystemDefaults() {
  const defaults = await fetch("stampede-config-defaults");
  return defaults;
}

/**
 * storeSystemOverrides
 * @param {*} overrides
 */
async function storeSystemOverrides(overrides) {
  await store("stampede-config-overrides", overrides);
}

/**
 * fetchSystemOverrides
 * @return {*} overrides
 */
async function fetchSystemOverrides() {
  const overrides = await fetch("stampede-config-overrides");
  return overrides;
}

// Builds

/**
 * incrementBuildNumber
 * @param {*} buildPath
 */
async function incrementBuildNumber(buildPath) {
  const buildNumber = await increment("stampede-" + buildPath);
  return buildNumber;
}

/**
 * fetchBuildNumber
 * @param {*} buildPath
 */
async function fetchBuildNumber(buildPath) {
  const buildNumber = await fetch("stampede-" + buildPath);
  return buildNumber;
}

/**
 * fetchActiveBuilds
 */
async function fetchActiveBuilds() {
  const builds = await fetchMembers("stampede-activebuilds");
  return builds;
}

/**
 * addBuildToActiveList
 * @param {*} build
 */
async function addBuildToActiveList(build) {
  await add("stampede-activebuilds", build);
}

/**
 * removeBuildFromActiveList
 * @param {*} build
 */
async function removeBuildFromActiveList(build) {
  await removeMember("stampede-activebuilds", build);
}

/**
 * Fetch active tasks
 * @param {*} build
 */
async function fetchActiveTasks(build) {
  const tasks = await fetchMembers("stampede-" + build);
  return tasks;
}

/**
 * addTaskToActiveList
 * @param {*} build
 * @param {*} task
 */
async function addTaskToActiveList(build, task) {
  await add("stampede-" + build, task);
}

/**
 * removeTaskFromActiveList
 * @param {*} build
 * @param {*} task
 */
async function removeTaskFromActiveList(build, task) {
  await removeMember("stampede-" + build, task);
}

/**
 * addTaskToPendingList
 * @param {*} parentTaskID
 * @param {*} task
 */
async function addTaskToPendingList(parentTaskID, task) {
  await add("stampede-" + parentTaskID, JSON.stringify(task));
}

/**
 * pendingTasks
 * @param {*} parentTaskID
 */
async function pendingTasks(parentTaskID) {
  const tasks = await fetchMembers("stampede-" + parentTaskID);
  const pending = [];
  if (tasks != null) {
    for (let index = 0; index < tasks.length; index++) {
      pending.push(JSON.parse(tasks[index]));
    }
  }
  return pending;
}

/**
 * removePendingList
 * @param {*} parentTaskID
 */
async function removePendingList(parentTaskID) {
  await remove("stampede-" + parentTaskID);
}

// Heartbeat

/**
 * storeWorkerHeartbeat
 * @param {*} heartbeat
 */
async function storeWorkerHeartbeat(heartbeat) {
  await add("stampede-activeworkers", heartbeat.workerID);
  await store("stampede-worker-" + heartbeat.workerID, heartbeat, 35);
}

/**
 * fetchActiveWorkers
 */
async function fetchActiveWorkers() {
  const activeWorkers = [];
  const workers = await fetchMembers("stampede-activeworkers");
  for (let index = 0; index < workers.length; index++) {
    const worker = await fetch("stampede-worker-" + workers[index]);
    if (worker != null) {
      activeWorkers.push(worker);
    } else {
      await removeMember("stampede-activeworkers", workers[index]);
    }
  }
  return activeWorkers;
}

// Private functions

/**
 * createRedisClient
 * @param {*} conf
 * @return {object} redis client
 */
function createRedisClient(conf) {
  if (conf.redisPassword != null) {
    return asyncRedis.createClient({
      host: conf.redisHost,
      port: conf.redisPort,
      password: conf.redisPassword
    });
  } else {
    return asyncRedis.createClient({
      host: conf.redisHost,
      port: conf.redisPort
    });
  }
}

/**
 * add
 * @param {*} key
 * @param {*} value
 */
async function add(key, value) {
  try {
    await client.sadd(key, value);
  } catch (e) {
    console.log("Error adding key " + key + ": " + e);
  }
}

/**
 * store
 * @param {*} key
 * @param {*} value
 * @param {int} expiring
 */
async function store(key, value, expiring) {
  try {
    if (expiring != null) {
      await client.set(key, JSON.stringify(value), "EX", expiring);
    } else {
      await client.set(key, JSON.stringify(value));
    }
  } catch (e) {
    console.log("Error setting key " + key + ": " + e);
  }
}

/**
 * increment
 * @param {*} key
 */
async function increment(key) {
  console.log("-- Incrementing: " + key);
  try {
    const value = await client.incr(key);
    return value;
  } catch (e) {
    console.log("Error incrementing key: " + key + " " + e);
    return null;
  }
}

/**
 * remove
 * @param {*} key
 */
async function remove(key) {
  try {
    await client.del(key);
  } catch (e) {
    console.log("Error removing " + key + ": " + e);
  }
}

/**
 * removeMember
 * @param {*} key
 * @param {*} value
 */
async function removeMember(key, value) {
  try {
    await client.srem(key, value);
  } catch (e) {
    console.log("Error removing " + key + ": " + value + ": " + e);
  }
}

/**
 * fetch
 * @param {*} key
 * @param {*} defaultValue
 */
async function fetch(key, defaultValue) {
  console.log("-- Fetching: " + key);
  try {
    const value = await client.get(key);
    if (value != null) {
      return JSON.parse(value);
    } else {
      return defaultValue;
    }
  } catch (e) {
    console.log("Error fetching key: " + key + " " + e);
    return defaultValue;
  }
}

/**
 * fetchMembers
 * @param {*} key
 * @param {*} defaultValue
 */
async function fetchMembers(key, defaultValue) {
  console.log("-- Fetching: " + key);
  try {
    const value = await client.smembers(key);
    if (value != null) {
      return value;
    } else {
      return defaultValue;
    }
  } catch (e) {
    console.log("Error fetching key: " + key + " " + e);
    return defaultValue;
  }
}

// General
module.exports.startCache = startCache;

// Tasks
module.exports.fetchTasks = fetchTasks;
module.exports.fetchTaskConfig = fetchTaskConfig;
module.exports.removeTaskConfig = removeTaskConfig;
module.exports.storeTask = storeTask;
module.exports.storeTaskConfig = storeTaskConfig;

// Repo config
module.exports.fetchRepoConfig = fetchRepoConfig;
module.exports.storeRepoConfig = storeRepoConfig;
module.exports.removeRepoConfig = removeRepoConfig;

// System config
module.exports.storeSystemQueues = storeSystemQueues;
module.exports.storeSystemDefaults = storeSystemDefaults;
module.exports.storeSystemOverrides = storeSystemOverrides;
module.exports.fetchSystemQueues = fetchSystemQueues;
module.exports.fetchSystemDefaults = fetchSystemDefaults;
module.exports.fetchSystemOverrides = fetchSystemOverrides;

// Builds
module.exports.fetchBuildNumber = fetchBuildNumber;
module.exports.incrementBuildNumber = incrementBuildNumber;
module.exports.fetchActiveBuilds = fetchActiveBuilds;
module.exports.addBuildToActiveList = addBuildToActiveList;
module.exports.removeBuildFromActiveList = removeBuildFromActiveList;
module.exports.fetchActiveTasks = fetchActiveTasks;
module.exports.addTaskToActiveList = addTaskToActiveList;
module.exports.removeTaskFromActiveList = removeTaskFromActiveList;
module.exports.addTaskToPendingList = addTaskToPendingList;
module.exports.pendingTasks = pendingTasks;
module.exports.removePendingList = removePendingList;

// Heartbeat
module.exports.storeWorkerHeartbeat = storeWorkerHeartbeat;
module.exports.fetchActiveWorkers = fetchActiveWorkers;
