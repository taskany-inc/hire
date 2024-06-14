import React, { useCallback, useState } from 'react';
import { InterviewStatus, RejectReason } from '@prisma/client';

import { Paths } from '../../utils/paths';
import { useUploadNotifications } from '../../modules/attachHooks';
import { useSession } from '../../contexts/appSettingsContext';
import CommentCreateForm from '../CommentCreateForm/CommentCreateForm';
import { CommentSchema } from '../../modules/commentTypes';
import { useCommentCreateMutation } from '../../modules/commentHooks';
import { InterviewWithRelations } from '../../modules/interviewTypes';
import { getFileIdFromPath } from '../../utils/fileUpload';
import { defaultAttachFormatter, File } from '../../utils/attachFormatter';
import { accessChecks } from '../../modules/accessChecks';

interface InterviewCommentCreateFormProps {
    interview: InterviewWithRelations;
    rejectReasons: RejectReason[];
    status?: InterviewStatus;
}

const InterviewCommentCreateForm: React.FC<InterviewCommentCreateFormProps> = ({
    interview,
    rejectReasons,
    status,
}) => {
    const session = useSession();
    const commentCreateMutation = useCommentCreateMutation();

    const { onUploadSuccess, onUploadFail } = useUploadNotifications();

    const [attachIds, setAttachIds] = useState<string[]>([]);

    const isVisibleHireOrRejected =
        session &&
        accessChecks.interview.update(session, interview.hireStreamId).allowed &&
        (interview.status === InterviewStatus.NEW || interview.status === InterviewStatus.IN_PROGRESS);

    const onCreateInterviewCommentSubmit = useCallback(
        async (value: CommentSchema) => {
            if (!session?.user) {
                return null;
            }

            const comment = await commentCreateMutation.mutateAsync({
                text: value.text,
                userId: session.user.id,
                target: { interviewId: interview.id, status: value.status },
                attachIds,
                status: value.status,
            });

            return comment;
        },
        [commentCreateMutation, interview.id, session?.user, attachIds],
    );

    const attachFormatter = useCallback((files: File[]) => {
        const ids = files.map((file) => getFileIdFromPath(file.filePath));
        setAttachIds((prev) => [...prev, ...ids]);
        return defaultAttachFormatter(files);
    }, []);

    return (
        <CommentCreateForm
            onUploadSuccess={onUploadSuccess}
            onUploadFail={onUploadFail}
            uploadLink={Paths.ATTACH}
            onSubmit={onCreateInterviewCommentSubmit}
            attachFormatter={attachFormatter}
            isVisibleHireOrRejected={isVisibleHireOrRejected}
            rejectReasons={rejectReasons}
            status={status}
        />
    );
};

export default InterviewCommentCreateForm;
