import { createClient } from 'redis';
const { promisify } = require('util');


class RedisClient {

  constructor() {
    this.client = createClient();
    //this.client.connect();
    this.client.get = promisify(this.client.get).bind(this.client);
    this.client.on('error', err => console.log('Redis Client Error', err));
}

  isAlive() {
    return this.client.isOpen;
  }

  async get(key) {
    return await this.client.get(key);
  }

  async set(key, value, exp) {
    return await this.client.set(key, value, {
      EX: exp,
    });
  }

  async del(key) {
    await this.client.del(key);
  }
}

const redisClient = new RedisClient();
export default redisClient;
