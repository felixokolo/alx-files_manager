import { createClient } from 'redis';


class RedisClient {

  constructor() {
    this.client = createClient();
    this.client.connect();
    this.client.on('error', err => console.log('Redis Client Error', err));
}

  isAlive() {
    return this.client.isReady;
  }

  async get(key) {
    return await this.client.get(key);
  }

  async set(key, value, exp) {
    return await this.client.set(key, value, {
      EX: exp,
    })
  }

  async del(key) {
    await this.client.del(key)
  }
}

const redisClient = new RedisClient();
export default redisClient;
