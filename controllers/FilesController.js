import RedisClient from '../utils/redis';
import dbClient from '../utils/db';

class FilesController {
  static async postUpload(request, response) {
    const token = request.headers['x-token'];
    if (token === undefined) {
      return response.status(401).send({error: 'Unauthorized'});
    }
    const key = "auth_" + token;
    const email = await RedisClient.get(key);
    if (email === null) {
      return response.status(401).send({error: 'Unauthorized'});
    }
    else {
      const user = await dbClient.users.findOne({ email: email });
      if (!user) return response.status(401).send({ error: 'Unauthorized' });
      const body = request.body;
      const name = body.name;
      const type = body.type;
      const data = body.data;
      const parentId = body.parentId;
      if (!name) return response.status(400).send({error: 'Missing name'});
      if (!type) return response.status(400).send({error: 'Missing type'});
      if (!data && type !== 'folder') return response.status(400).send({error: 'Missing data'});
      if (!!parentId) {
        const parent = dbClient.files.findOne({id: parentId});
        if (!parent) return response.status(400).send({error: 'Parent not found'});
        if (parent.type !== 'folder') return response.status(400).send({error: 'Parent is not a folder'});
      }
      const doc = {userId: user._id};
      if (type === 'folder'){
        const _id = dbClient.files.insertOne(doc);
      }
    }
  }
}

export default FilesController;