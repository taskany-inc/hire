import React, { useCallback, useState } from 'react';

import { Paths } from '../../utils/paths';
import { useUploadNotifications } from '../../modules/attachHooks';
import { useSession } from '../../contexts/appSettingsContext';
import CommentCreateForm from '../CommentCreateForm/CommentCreateForm';
import { CommentSchema } from '../../modules/commentTypes';
import { useCommentCreateMutation } from '../../modules/commentHooks';
import { ProblemWithRelationsAndProblemSection } from '../../modules/problemTypes';
import { getFileIdFromPath } from '../../utils/fileUpload';
import { defaultAttachFormatter, File } from '../../utils/attachFormatter';

interface ProblemCommentCreateFormProps {
    problem: ProblemWithRelationsAndProblemSection;
}

const ProblemCommentCreateForm: React.FC<ProblemCommentCreateFormProps> = ({ problem }) => {
    const session = useSession();
    const commentCreateMutation = useCommentCreateMutation();

    const { onUploadSuccess, onUploadFail } = useUploadNotifications();

    const [attachIds, setAttachIds] = useState<string[]>([]);

    const attachFormatter = useCallback((files: File[]) => {
        const ids = files.map((file) => getFileIdFromPath(file.filePath));
        setAttachIds((prev) => [...prev, ...ids]);
        return defaultAttachFormatter(files);
    }, []);

    const onCreateProblemCommentSubmit = useCallback(
        async (value: CommentSchema) => {
            if (!session?.user) {
                return null;
            }

            const result = await commentCreateMutation.mutateAsync({
                text: value.text,
                userId: session.user.id,
                target: { problemId: problem.id },
                attachIds,
            });
            return result;
        },
        [commentCreateMutation, problem.id, session?.user],
    );

    return (
        <CommentCreateForm
            onUploadSuccess={onUploadSuccess}
            onUploadFail={onUploadFail}
            uploadLink={Paths.ATTACH}
            onSubmit={onCreateProblemCommentSubmit}
            attachFormatter={attachFormatter}
        />
    );
};

export default ProblemCommentCreateForm;
