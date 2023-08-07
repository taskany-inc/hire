import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import stream from 'stream';

import { parseError } from '../utils/error-parsing';
import { ErrorWithStatus } from '../utils';

import { attachDbService } from './modules/attach/attach-db-service';
import { getObject, loadPic } from './modules/s3/s3-module';
import { tr } from './backend.i18n';

import { prisma } from '.';

export const postHandler = async (req: NextApiRequest, res: NextApiResponse) => {
    const form = formidable({ multiples: true });
    const sectionId = req.query.id;

    await new Promise((resolve, reject) => {
        form.parse(req, async (err, fields, files) => {
            if (err) {
                const { status, message } = parseError(err);

                return reject(new ErrorWithStatus(message, status));
            }

            if (!files.data) return reject(new ErrorWithStatus(tr('No data'), 400));

            const { data } = files;

            if (!(data instanceof Array)) return reject(new ErrorWithStatus(tr('Data not in array'), 400));

            const section = await prisma.section.findFirst({
                where: { id: Number(sectionId) },
                orderBy: {
                    createdAt: 'asc',
                },
                include: {
                    attaches: true,
                },
            });

            if (!section) return reject(new ErrorWithStatus(`${tr('No section')} ${sectionId}`, 400));
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

    res.json(tr('file uploaded'));
};

export const getHandler = async (req: NextApiRequest, res: NextApiResponse) => {
    const fileId = req.query.id;

    const attach = await attachDbService.getById(String(fileId));

    const file = await getObject(attach.link);

    if (!file) throw new ErrorWithStatus(tr('No file finded'), 404);

    const newFileName = encodeURIComponent(attach.filename);

    res.setHeader('Content-Type', file.ContentType || '');
    res.setHeader('Content-Disposition', `filename*=UTF-8''${newFileName}`);

    const readableStream = file.Body as stream.Readable;

    readableStream.pipe(res);
};
