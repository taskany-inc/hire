import { useEffect, useId, useMemo, useState } from 'react';
import { useUpload } from '@taskany/bricks';
import { Badge, Input } from '@taskany/bricks/harmony';
import { IconAttachOutline, IconPlusCircleOutline } from '@taskany/icons';

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

    const badgeText = useMemo(() => {
        if (upload.loading) return tr('Uploading...');
        if (cvAttachFilename) return `${tr('CV:')} ${cvAttachFilename}`;
        return tr('Attach CV');
    }, [upload.loading, cvAttachFilename]);

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
                <Badge
                    iconLeft={
                        cvAttachFilename ? (
                            <IconAttachOutline size="xs" className={s.CvAttachFileInputIcon} />
                        ) : (
                            <IconPlusCircleOutline size="xs" className={s.CvAttachFileInputIcon} />
                        )
                    }
                    text={badgeText}
                    className={s.CvAttachFileInputText}
                />
            </label>
        </>
    );
};
