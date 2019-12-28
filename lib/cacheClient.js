"use strict";
const asyncRedis = require("async-redis");

let client;

/**
 * createRedisClient
 * @param {*} conf
 * @return {object} redis client
 */
function createRedisClient(conf) {
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
    console.log("redis connect error: " + err);
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
