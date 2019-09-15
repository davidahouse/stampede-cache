'use strict'
const asyncRedis = require('async-redis')

let client

// Public functions

function startCache(conf) {
  client = createRedisClient(conf)
  client.on('error', function(err) {
    console.log('redis connect error: ' + err)
  })
}

async function storeTaskConfig(tasks) {
  for (let index = 0; index < tasks.length; index++) {
    await add('stampede-tasks', tasks[index].id)
    await store('stampede-tasks-' + tasks[index].id, tasks[index])
  }
}

async function fetchTasks() {
  let tasks = await fetchMembers('stampede-tasks')
  return tasks
}

async function fetchTaskConfig(id) {
  let config = await fetch('stampede-task-' + id)
  return config
}

async function fetchRepoConfig(owner, repo) {
  let config = await fetch('stampede-' + owner + '-' + repo + '-config')
  return config
}

async function incrementBuildNumber(buildPath) {
  const buildNumber = await increment('stampede-' + buildPath)
  return buildNumber
}

async function addBuildToActiveList(build) {
  await add('stampede-activebuilds', build)
}

async function addTaskToActiveList(task) {
  await add('stampede-activetasks', task)
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

module.exports.startCache = startCache
module.exports.storeTaskConfig = storeTaskConfig
module.exports.fetchTasks = fetchTasks
module.exports.fetchRepoConfig = fetchRepoConfig
module.exports.incrementBuildNumber = incrementBuildNumber
module.exports.fetchTaskConfig = fetchTaskConfig
module.exports.addBuildToActiveList = addBuildToActiveList
module.exports.addTaskToActiveList = addTaskToActiveList
