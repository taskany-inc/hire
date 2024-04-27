/* eslint-disable no-await-in-loop */
import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import stream from 'stream';
import { formFieldName } from '@taskany/bricks';

import { parseError } from '../utils/errorParsing';
import { ErrorWithStatus } from '../utils';
import { parseNumber, parseString } from '../utils/paramParsers';
import { pageHrefs } from '../utils/paths';

import { attachMethods } from './attachMethods';
import { getObject, loadFile } from './s3Methods';
import { tr } from './modules.i18n';
import { aiAssistantMethods } from './aiAssistantMethods';
import { CvParsingResult } from './aiAssistantTypes';
import { candidateMethods } from './candidateMethods';

interface ResponseObj {
    failed: { type: string; filePath: string; name: string }[];
    succeeded: { type: string; filePath: string; name: string; cvParsingResult?: CvParsingResult }[];
    errorMessage?: string;
}

export const postHandler = async (req: NextApiRequest, res: NextApiResponse) => {
    const form = formidable({ multiples: true });
    const sectionId = parseNumber(req.query.sectionId);
    const interviewId = parseNumber(req.query.interviewId);
    const commentId = parseString(req.query.commentId);
    const { parseCv } = req.query;
    const candidateId = parseNumber(req.query.candidateId);

    await new Promise((_resolve, reject) => {
        form.parse(req, async (err, _fields, files) => {
            if (err) {
                const { status, message } = parseError(err);

                return reject(new ErrorWithStatus(message, status));
            }

            if (!files[formFieldName]) return reject(new ErrorWithStatus(tr('No data'), 400));

            const data = [files[formFieldName]].flat();

            const resultObject: ResponseObj = {
                failed: [],
                succeeded: [],
            };

            for (const file of data) {
                const filename = file.originalFilename || file.newFilename;
                const link = `${Date.now()}_${filename}`;
                const stream = fs.createReadStream(file.filepath);
                let cvParsingResult: CvParsingResult | undefined;
                if (parseCv) {
                    const buffer = fs.readFileSync(file.filepath);
                    cvParsingResult = await aiAssistantMethods.parseCv(buffer);
                    if (candidateId) {
                        await candidateMethods.update({
                            candidateId,
                            email: cvParsingResult?.email,
                            phone: cvParsingResult?.phone,
                        });
                    }
                }
                const response = await loadFile(link, stream, file.mimetype || '');

                if (response) {
                    resultObject.errorMessage = response;
                    resultObject.failed.push({ type: file.mimetype || '', filePath: filename, name: filename });
                } else {
                    const attach = await attachMethods.create({
                        link,
                        filename,
                        sectionId,
                        interviewId,
                        commentId,
                    });
                    resultObject.succeeded.push({
                        type: file.mimetype || '',
                        filePath: pageHrefs.attach(attach.id),
                        name: filename,
                        cvParsingResult,
                    });
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
