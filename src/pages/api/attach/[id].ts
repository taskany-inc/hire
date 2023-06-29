/* eslint-disable no-await-in-loop */
import formidable from 'formidable';
import fs from 'fs';
import stream from 'stream';

import { getApiHandler } from '../../../backend/api-handler.util';
import { getAuthChecker } from '../../../backend/auth.midlewares';
import { accessGuards } from '../../../backend/access/access-guards';
import { getObject, loadPic, removePic } from '../../../backend/modules/s3/s3-module';
import { ErrorWithStatus } from '../../../utils';
import { prisma } from '../../../backend';
import { attachDbService } from '../../../backend/modules/attach/attach-db-service';
import { parseError } from '../../../utils/error-parsing';

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
    .post(accessGuards.attach.create, async (req, res) => {
        const form = formidable({ multiples: true });
        const sectionId = req.query.id;

        await new Promise((resolve, reject) => {
            form.parse(req, async (err, fields, files) => {
                if (err) {
                    const { status, message } = parseError(err);

                    return reject(new ErrorWithStatus(message, status));
                }

                if (!files.data) return reject(new ErrorWithStatus('No data', 400));

                const { data } = files;

                if (!(data instanceof Array)) return reject(new ErrorWithStatus('Data not in array', 400));

                const section = await prisma.section.findFirst({
                    where: { id: Number(sectionId) },
                    orderBy: {
                        createdAt: 'asc',
                    },
                    include: {
                        attaches: true,
                    },
                });

                if (!section) return reject(new ErrorWithStatus(`'No section' ${sectionId}`, 400));
                const file = data[0];
                const filename = file.originalFilename || file.newFilename;

                await loadPic(
                    `${sectionId}/${file.originalFilename}`,
                    fs.createReadStream(file.filepath),
                    file.mimetype || 'image/png',
                ).catch(reject);
                const newFile = await attachDbService
                    .create({
                        link: `section/${sectionId}/${file.originalFilename}`,
                        filename,
                        sectionId: Number(sectionId),
                    })
                    .catch(reject);
                resolve(true);
                res.send(newFile);
            });
        });

        res.json('file uploaded');
    })
    .get(accessGuards.attach.readOne, async (req, res) => {
        const fileId = req.query.id;

        const attach = await attachDbService.getById(String(fileId));

        const file = await getObject(attach.link);

        if (!file) throw new ErrorWithStatus('No file finded', 404);

        const newFileName = encodeURIComponent(attach.filename);

        res.setHeader('Content-Type', file.ContentType || '');
        res.setHeader('Content-Disposition', `filename*=UTF-8''${newFileName}`);

        const readableStream = file.Body as stream.Readable;

        readableStream.pipe(res);
    });

export default handler;
