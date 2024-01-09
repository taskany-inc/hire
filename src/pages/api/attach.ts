/* eslint-disable no-await-in-loop */
import { getApiHandler, getAuthChecker } from '../../utils/apiHandler';
import { accessGuards } from '../../modules/attachAccess';
import { removeFile } from '../../modules/s3Methods';
import { attachMethods } from '../../modules/attachMethods';
import { postHandler, getHandler } from '../../modules/attachHandler';

export const config = {
    api: {
        bodyParser: false,
    },
};

const handler = getApiHandler()
    .use(getAuthChecker())
    .delete(accessGuards.attach.delete, async (req, res) => {
        const fileId = String(req.query.id);
        const attach = await attachMethods.getById(String(fileId));

        await removeFile(attach.link);
        const result = await attachMethods.delete(fileId);
        res.send(result);
    })
    .post(accessGuards.attach.create, postHandler)
    .get(accessGuards.attach.readOne, getHandler);

export default handler;
