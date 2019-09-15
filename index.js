'use strict'
const asyncRedis = require('async-redis')

/**
* This class represents a high level Web Request
*/
class StampedeCache {
  /**
  * Constructor for the StampedeCache class
  * @param {object} config the redis config details
  */
  constructor(config) {
    this.config = config
    
    this.client = createClient(config)
    this.client.on('error', function(err) {
      console.log('redis connect error: ' + err)
    })

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

    this.storeTaskConfig = function(tasks) {
      for (let index = 0; index < tasks.length; index++) {
        await this.client.add('stampede-tasks', tasks[index].id)
        await this.client.store('stampede-tasks-' + tasks[index].id, tasks[index])
      }
    }
  }
}

module.exports = StampedeCache
