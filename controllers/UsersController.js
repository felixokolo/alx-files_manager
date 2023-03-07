import dbClient from '../utils/db';
import crypto from 'crypto';


class UsersController {

  static async postNew(request, response) {
    const email = request.body.email;
    const password = request.body.password;
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
    return response.status(201).send({id: result.insertedId, email: email});
  }

}

export default UsersController;