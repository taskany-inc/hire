/* eslint-disable no-await-in-loop */
import { getApiHandler } from '../../../backend/api-handler.util';
import { getAuthChecker } from '../../../backend/auth.midlewares';
import { accessGuards } from '../../../backend/access/access-guards';
import { removePic } from '../../../backend/modules/s3/s3-module';
import { attachDbService } from '../../../backend/modules/attach/attach-db-service';
import { postHandler, getHandler } from '../../../backend/attach';

export const config = {
    api: {
        bodyParser: false,
    },
};

const handler = getApiHandler()
    .use(getAuthChecker())
    .delete(accessGuards.attach.delete, async (req, res) => {
        const fileId = String(req.query.id);
        const attach = await attachDbService.getById(String(fileId));

        await removePic(attach.link);
        const result = await attachDbService.delete(fileId);
        res.send(result);
    })
    .post(accessGuards.attach.create, postHandler)
    .get(accessGuards.attach.readOne, getHandler);

export default handler;
