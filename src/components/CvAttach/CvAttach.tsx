import { useEffect, useId, useState } from 'react';
import { Input, useUpload, Text, nullable } from '@taskany/bricks';
import { IconAttachOutline } from '@taskany/icons';

import { pageHrefs } from '../../utils/paths';
import { CvParsingResult } from '../../modules/aiAssistantTypes';
import { getFileIdFromPath } from '../../utils/fileUpload';

import { tr } from './CvAttach.i18n';
import s from './CvAttach.module.css';

interface CvAttachProps {
    candidateId?: number;
    preparedCvAttach?: { id: string; filename: string };
    onParse: (attach: { id: string; filename: string }, parsedData: CvParsingResult) => void;
}

export const CvAttach = ({ candidateId, preparedCvAttach, onParse }: CvAttachProps) => {
    const id = useId();

    const [cvAttachId, setCvAttachId] = useState(preparedCvAttach?.id);
    const [cvAttachFilename, setCvAttachFilename] = useState(preparedCvAttach?.filename);

    const upload = useUpload(undefined, undefined, pageHrefs.attachAndParseCv(candidateId));

    useEffect(() => {
        const file = upload.files?.[0];
        if (!file) return;
        if ('cvParsingResult' in file) {
            const cvId = getFileIdFromPath(file.filePath);
            if (cvId === cvAttachId) return;
            setCvAttachId(cvId);
            setCvAttachFilename(file.name);
            onParse({ id: cvId, filename: file.name }, file.cvParsingResult as CvParsingResult);
        }
    }, [upload.files, onParse, cvAttachId]);

    const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        await upload.uploadFiles(Array.from(e.target.files));
    };

    return (
        <>
            <Input
                type="file"
                id={id}
                accept="application/msword,application/pdf"
                onChange={onFileChange}
                className={s.CvAttachFileInput}
            />
            <label htmlFor={id}>
                <Text size="s" className={s.CvAttachFileInputText}>
                    {nullable(upload.loading, () => tr('Uploading...'))}
                    {nullable(cvAttachFilename, () => `${tr('CV:')} ${cvAttachFilename}`)}
                    {nullable(!upload.loading && !cvAttachFilename, () => (
                        <>
                            <IconAttachOutline size="xxs" /> {tr('Attach CV')}
                        </>
                    ))}
                </Text>
            </label>
        </>
    );
};
