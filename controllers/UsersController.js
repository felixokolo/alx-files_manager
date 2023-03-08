import dbClient from '../utils/db';
import sha1 from 'sha1';
const { ObjectId } = require('mongodb');
import RedisClient from '../utils/redis';


class UsersController {

  static async postNew(request, response) {
    const email = request.body.email;
    const password = request.body.password;
    if (!email) {
      return response.status(400).send({'error': 'Missing email'});
    }
    if (!password) {
      return response.status(400).send({'error': 'Missing password'});
    }

    const exist = await dbClient.users.findOne({'email': email});
    if (!!exist) {
      return response.status(400).send({'error': 'Already exist'})
    }
    const hashedPassword = sha1(password);
    const result = await dbClient.users.insertOne({ email: email, password: hashedPassword });
    return response.status(201).send({id: result.insertedId, email: email});
  }

  static async getMe(request, response) {
    const token = request.headers['x-token'] || null;
    if (!token) {
      return response.status(401).send({error: 'Unauthorized'});
    }
    const key = "auth_" + token;
    const email = await RedisClient.get(key);
    if (!email) {
      return response.status(401).send({error: 'Unauthorized'});
    }
    else {
      const user = await dbClient.users.findOne({ email: email });
      if (!user) return response.status(401).send({ error: 'Unauthorized' });
      delete user.password;

      return response.status(200).send({ id: user._id, email: user.email });
    }
  }

}

export default UsersController;