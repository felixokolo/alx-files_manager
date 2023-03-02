import { createClient } from 'redis';


class RedisClient {

  constructor(){
    this.client = createClient();
    client.on('error', err => console.log('Redis Client Error', err));

}

  isAlive = () => {
    this.client.connect().then((res) => true, (err) => false);
  }

  get = async (key) => {
    return await this.client.get(key);
  }

  set = async (key, value, exp) => {
    return await this.client.set(key, value, {
      EX: exp,
    })
  }

  del = async (key) => {
    await this.client.del(key)
  }
}

export default redisClient = RedisClient();