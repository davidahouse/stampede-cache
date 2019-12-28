let cache = {};

function reset() {
  cache = {};
}

function getCache() {
  return cache;
}

function createRedisClient(conf) {}

/**
 * add
 * @param {*} key
 * @param {*} value
 */
async function add(key, value) {
  cache[key] = value;
}

/**
 * store
 * @param {*} key
 * @param {*} value
 * @param {int} expiring
 */
async function store(key, value, expiring) {
  cache[key] = value;
}

/**
 * increment
 * @param {*} key
 */
async function increment(key) {}

/**
 * remove
 * @param {*} key
 */
async function remove(key) {
  delete cache[key];
}

/**
 * removeMember
 * @param {*} key
 * @param {*} value
 */
async function removeMember(key, value) {
  cache[key].delete(value);
}

/**
 * fetch
 * @param {*} key
 * @param {*} defaultValue
 */
async function fetch(key, defaultValue) {
  if (cache[key] == null) {
    return defaultValue;
  } else {
    return cache[key];
  }
}

/**
 * fetchMembers
 * @param {*} key
 * @param {*} defaultValue
 */
async function fetchMembers(key, defaultValue) {
  return cache[key];
}

/**
 * quit
 */
async function quit() {}

module.exports.reset = reset;
module.exports.getCache = getCache;
module.exports.createRedisClient = createRedisClient;
module.exports.add = add;
module.exports.store = store;
module.exports.increment = increment;
module.exports.remove = remove;
module.exports.removeMember = removeMember;
module.exports.fetch = fetch;
module.exports.fetchMembers = fetchMembers;
module.exports.quit = quit;
