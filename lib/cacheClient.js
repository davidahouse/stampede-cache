"use strict";
const asyncRedis = require("async-redis");

let client;
let systemLogger;

/**
 * createRedisClient
 * @param {*} conf
 * @param {*} logger
 * @return {object} redis client
 */
function createRedisClient(conf, logger) {
  systemLogger = logger;
  if (conf.redisPassword != null) {
    client = asyncRedis.createClient({
      host: conf.redisHost,
      port: conf.redisPort,
      password: conf.redisPassword
    });
  } else {
    client = asyncRedis.createClient({
      host: conf.redisHost,
      port: conf.redisPort
    });
  }
  client.on("error", function(err) {
    systemLogger.error("redis connect error: " + err);
  });
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
    systemLogger.error("Error adding key " + key + ": " + e);
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
    systemLogger.error("Error setting key " + key + ": " + e);
  }
}

/**
 * increment
 * @param {*} key
 */
async function increment(key) {
  systemLogger.verbose("CACHE: Incrementing: " + key);
  try {
    const value = await client.incr(key);
    return value;
  } catch (e) {
    systemLogger.error("Error incrementing key: " + key + " " + e);
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
    systemLogger.error("Error removing " + key + ": " + e);
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
    systemLogger.error("Error removing " + key + ": " + value + ": " + e);
  }
}

/**
 * fetch
 * @param {*} key
 * @param {*} defaultValue
 */
async function fetch(key, defaultValue) {
  systemLogger.verbose("CACHE: Fetching: " + key);
  try {
    const value = await client.get(key);
    if (value != null) {
      return JSON.parse(value);
    } else {
      return defaultValue;
    }
  } catch (e) {
    systemLogger.error("Error fetching key: " + key + " " + e);
    return defaultValue;
  }
}

/**
 * fetchMembers
 * @param {*} key
 * @param {*} defaultValue
 */
async function fetchMembers(key, defaultValue) {
  systemLogger.verbose("CACHE: Fetching: " + key);
  try {
    const value = await client.smembers(key);
    if (value != null) {
      return value;
    } else {
      return defaultValue;
    }
  } catch (e) {
    systemLogger.error("Error fetching key: " + key + " " + e);
    return defaultValue;
  }
}

/**
 * quit
 */
async function quit() {
  await client.quit();
}

module.exports.createRedisClient = createRedisClient;
module.exports.add = add;
module.exports.store = store;
module.exports.increment = increment;
module.exports.remove = remove;
module.exports.removeMember = removeMember;
module.exports.fetch = fetch;
module.exports.fetchMembers = fetchMembers;
module.exports.quit = quit;
