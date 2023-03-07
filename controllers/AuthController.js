import dbClient from '../utils/db';
import { v4 as uuid } from 'uuid';
import crypto from 'crypto';
import RedisClient from '../utils/redis';

class AuthController {

  static async getConnect(request, response) {
    if (request.headers.authorization === undefined) {
      response.status(401).send({error: 'Unauthorized'});
    }
    const auth = request.headers.authorization;
    const emPas = auth.split(' ');
    if (emPas[0] !== 'Basic') {
      response.status(401).send({error: 'Unauthorized'});
    }
    const emPasUTF = Buffer.from(emPas[1], 'base64').toString('utf-8');
    const email = emPasUTF.split(':')[0];
    const password = emPasUTF.split(':')[1];
    const hashedPassword = crypto.createHash('sha1').update(password).digest('hex');
    const exist = await dbClient.users.findOne({email: email, password: hashedPassword});
    if (exist === null) {
      response.status(401).send({error: 'Unauthorized'});
    }
    else {
      const token = uuid();
      const key = "auth_" + token;
      RedisClient.set(key, email, 24*60*60);
      response.status(200).send({token: token});
    }
  }
}

export default AuthController;