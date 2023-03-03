import { createClient } from 'redis';


class RedisClient {

  constructor() {
    this.client = createClient();
    this.client.on('error', err => console.log('Redis Client Error', err));

}

  isAlive() {
    this.client.connect().then((res) => true, (err) => false);
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

export const redisClient = new RedisClient();
