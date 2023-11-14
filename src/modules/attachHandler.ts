/* eslint-disable no-await-in-loop */
import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import stream from 'stream';
import { formFieldName } from '@taskany/bricks';

import { parseError } from '../utils/errorParsing';
import { prisma } from '../utils/prisma';
import { ErrorWithStatus } from '../utils';

import { attachMethods } from './attachMethods';
import { getObject, loadPic } from './s3Methods';
import { tr } from './modules.i18n';

type ResponseObj = {
    failed: string[];
    succeeded: string[];
    errorMessage?: string;
};

export const postHandler = async (req: NextApiRequest, res: NextApiResponse) => {
    const form = formidable({ multiples: true });
    const sectionId = req.query.id;

    await new Promise((_resolve, reject) => {
        form.parse(req, async (err, _fields, files) => {
            if (err) {
                const { status, message } = parseError(err);

                return reject(new ErrorWithStatus(message, status));
            }

            if (!files[formFieldName]) return reject(new ErrorWithStatus(tr('No data'), 400));

            const data = [files[formFieldName]].flat();

            const section = await prisma.section.findFirst({
                where: { id: Number(sectionId) },
                orderBy: {
                    createdAt: 'asc',
                },
                include: {
                    attaches: true,
                },
            });

            const resultObject: ResponseObj = {
                failed: [],
                succeeded: [],
            };

            if (!section) return reject(new ErrorWithStatus(`${tr('No section')} ${sectionId}`, 400));

            for (const file of data) {
                const filename = file.originalFilename || file.newFilename;
                const link = `section/${sectionId}/${file.originalFilename}`;
                const response = await loadPic(
                    `${sectionId}/${file.originalFilename}`,
                    fs.createReadStream(file.filepath),
                    file.mimetype || 'image/png',
                );

                if (response) {
                    resultObject.errorMessage = response;
                    resultObject.failed.push(filename);
                } else {
                    const newFile = await attachMethods.create({
                        link,
                        filename,
                        sectionId: Number(sectionId),
                    });

                    resultObject.succeeded.push(`/api/attach/${newFile.id}`);
                }
            }

            res.send(resultObject);
        });
    });
};

export const getHandler = async (req: NextApiRequest, res: NextApiResponse) => {
    const fileId = req.query.id;

    const attach = await attachMethods.getById(String(fileId));

    const file = await getObject(attach.link);

    if (!file) throw new ErrorWithStatus(tr('No file finded'), 404);

    const newFileName = encodeURIComponent(attach.filename);

    res.setHeader('Content-Type', file.ContentType || '');
    res.setHeader('Content-Disposition', `filename*=UTF-8''${newFileName}`);

    const readableStream = file.Body as stream.Readable;

    readableStream.pipe(res);
};
