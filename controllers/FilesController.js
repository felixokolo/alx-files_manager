import RedisClient from '../utils/redis';
import dbClient from '../utils/db';
import { v4 as uuid } from 'uuid';
const fs = require('fs');

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
      const isPublic = request.body.isPublic || false;
      let parentId = request.body.parentId || 0;
      parentId = parentId === '0' ? 0 : parentId;
      if (!name) return response.status(400).send({error: 'Missing name'});
      if (!type || !['folder', 'file', 'image'].includes(type)) return response.status(400).send({error: 'Missing type'});
      if (!data && type !== 'folder') return response.status(400).send({error: 'Missing data'});
      if (parentId !== 0) {
        const parent = dbClient.files.findOne({id: parentId});
        if (!parent) return response.status(400).send({error: 'Parent not found'});
        if (parent.type !== 'folder') return response.status(400).send({error: 'Parent is not a folder'});
      }
      const doc = {userId: user._id,
        name: name,
        type: type,
        isPublic: isPublic,
        parentId: parentId,};

      if (type === 'folder'){
        const _id = await dbClient.files.insertOne(doc);
        return response.status(201).send({id: doc._id, ...doc});
      }

      const pathDir = process.env.FOLDER_PATH || '/tmp/files_manager';
    const fileUuid = uuid();

    const buff = Buffer.from(data, 'base64');
    const pathFile = `${pathDir}/${fileUuid}`;

    fs.mkdir(pathDir, { recursive: true }, (error) => {
      if (error) return response.status(400).send({ error: error.message });
      return true;
    });

    await fs.writeFile(pathFile, buff, (error) => {
      if (error) return response.status(400).send({ error: error.message });
      return true;
    });

    doc.localPath = pathFile;
    await dbClient.files.insertOne(doc);

    /* fileQueue.add({
      userId: doc.userId,
      fileId: doc._id,
    }); */

    return response.status(201).send({
      id: doc._id,
      userId: doc.userId,
      name: doc.name,
      type: doc.type,
      isPublic: doc.isPublic,
      parentId: doc.parentId,
    });
    }
  }
}

export default FilesController;