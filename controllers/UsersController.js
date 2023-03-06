import RedisClient from '../utils/redis';
import dbClient from '../utils/db';
import crypto from 'crypto';
import { exist } from 'mongodb/lib/gridfs/grid_store';


class UsersController {

  static async postNew(request, response) {
    const email = request.body.email;
    const password = request.body.password;
    console.log(password);
    if (email === undefined) {
      return response.status(400).send({'error': 'Missing email'});
    }
    if (password === undefined) {
      return response.status(400).send({'error': 'Missing password'});
    }

    const exist = await dbClient.users.findOne({'email': email});
    if (exist !== null) {
      return response.status(400).send({'error': 'Already exist'})
    }
    const hashedPassword = crypto.createHash('sha1').update(password).digest('hex');
    const result = await dbClient.users.insertOne({ email: email, password: hashedPassword });
    return response.send({userId: result.insertedId, email: email});
  }

}

export default UsersController;