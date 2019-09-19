'use strict'
const asyncRedis = require('async-redis')

let client

// Public functions

// General

/**
 * startCache
 * @param {*} conf 
 */
function startCache(conf) {
  client = createRedisClient(conf)
  client.on('error', function(err) {
    console.log('redis connect error: ' + err)
  })
}

// Tasks

/**
 * fetchTasks
 */
async function fetchTasks() {
  let tasks = await fetchMembers('stampede-tasks')
  return tasks
}

/**
 * fetchTaskConfig
 * @param {*} id 
 * @return {Object} task config
 */
async function fetchTaskConfig(id) {
  let config = await fetch('stampede-tasks-' + id)
  return config
}

/**
 * storeTaskConfig
 * @param {*} tasks 
 */
async function storeTaskConfig(tasks) {
  for (let index = 0; index < tasks.length; index++) {
    await add('stampede-tasks', tasks[index].id)
    await store('stampede-tasks-' + tasks[index].id, tasks[index])
  }
}

// Repo Config

/**
 * fetchRepoConfig
 * @param {*} owner 
 * @param {*} repo 
 * @return {Object} config
 */
async function fetchRepoConfig(owner, repo) {
  let config = await fetch('stampede-' + owner + '-' + repo + '-config')
  return config
}

/**
 * storeRepoConfig
 * @param {*} owner 
 * @param {*} repo 
 * @param {*} config 
 */
async function storeRepoConfig(owner, repo, config) {
  await store('stampede-' + owner + '-' + repo + '-config', config)
}

// System level config

/**
 * storeSystemDefaults
 * @param {*} defaults 
 */
async function storeSystemDefaults(defaults) {
  await store('stampede-config-defaults', defaults)
}

/**
 * storeSystemOverrides
 * @param {*} overrides 
 */
async function storeSystemOverrides(overrides) {
  await store('stampede-config-overrides', overrides)
}

// Builds

/**
 * incrementBuildNumber
 * @param {*} buildPath 
 */
async function incrementBuildNumber(buildPath) {
  const buildNumber = await increment('stampede-' + buildPath)
  return buildNumber
}

/**
 * fetchActiveBuilds
 */
async function fetchActiveBuilds() {
  const builds = await fetchMembers('stampede-activebuilds')
  return builds
}

/**
 * addBuildToActiveList
 * @param {*} build 
 */
async function addBuildToActiveList(build) {
  await add('stampede-activebuilds', build)
}

/**
 * removeBuildFromActiveList
 * @param {*} build
 */
async function removeBuildFromActiveList(build) {
  await removeMember('stampede-activebuilds', build)
}

/**
 * Fetch active tasks
 * @param {*} build 
 */
async function fetchActiveTasks(build) {
  const tasks = await fetchMembers('stampede-' + build)
  return tasks
}

/**
 * addTaskToActiveList
 * @param {*} build
 * @param {*} task 
 */
async function addTaskToActiveList(build, task) {
  await add('stampede-' + build, task)
}

/**
 * removeTaskFromActiveList
 * @param {*} build
 * @param {*} task
 */
async function removeTaskFromActiveList(build, task) {
  await removeMember('stampede-' + build, task)
}


// Private functions

function createRedisClient(conf) {
  if (conf.redisPassword != null) {
    return asyncRedis.createClient({host: conf.redisHost,
      port: conf.redisPort,
      password: conf.redisPassword})
  } else {
    return asyncRedis.createClient({host: conf.redisHost,
      port: conf.redisPort})
  }
}

async function add(key, value) {
  try {
    await client.sadd(key, value)
  } catch (e) {
    console.log('Error adding key ' + key + ': ' + e)
  }
}

async function store(key, value) {
  try {
    await client.set(key, JSON.stringify(value))
  } catch (e) {
    console.log('Error setting key ' + key + ': ' + e)
  }
}

async function increment(key) {
  console.log('-- Incrementing: ' + key)
  try {
    const value = await client.incr(key)
    return value
  } catch (e) {
    console.log('Error incrementing key: ' + key + ' ' + e)
    return null
  }
}

async function remove(key) {
  try {
    await client.del(key)
  } catch (e) {
    console.log('Error removing ' + key + ': ' + e)
  }
}

async function removeMember(key, value) {
  try {
    await client.srem(key, value)
  } catch (e) {
    console.log('Error removing ' + key + ': ' + value + ': ' + e)
  }
}

async function fetch(key, defaultValue) {
  console.log('-- Fetching: ' + key)
  try {
    const value = await client.get(key)
    if (value != null) {
      return JSON.parse(value)
    } else {
      return defaultValue
    }
  } catch (e) {
    console.log('Error fetching key: ' + key + ' ' + e)
    return defaultValue
  }
}

async function fetchMembers(key, defaultValue) {
  console.log('-- Fetching: ' + key)
  try {
    const value = await client.smembers(key)
    if (value != null) {
      return value
    } else {
      return defaultValue
    }
  } catch (e) {
    console.log('Error fetching key: ' + key + ' ' + e)
    return defaultValue
  }
}

// General
module.exports.startCache = startCache

// Tasks
module.exports.fetchTasks = fetchTasks
module.exports.fetchTaskConfig = fetchTaskConfig
module.exports.storeTaskConfig = storeTaskConfig

// Repo config
module.exports.fetchRepoConfig = fetchRepoConfig
module.exports.storeRepoConfig = storeRepoConfig

// System config
module.exports.storeSystemDefaults = storeSystemDefaults
module.exports.storeSystemOverrides = storeSystemOverrides

// Builds
module.exports.incrementBuildNumber = incrementBuildNumber
module.exports.fetchActiveBuilds = fetchActiveBuilds
module.exports.addBuildToActiveList = addBuildToActiveList
module.exports.removeBuildFromActiveList = removeBuildFromActiveList
module.exports.fetchActiveTasks = fetchActiveTasks
module.exports.addTaskToActiveList = addTaskToActiveList
module.exports.removeTaskFromActiveList = removeTaskFromActiveList
