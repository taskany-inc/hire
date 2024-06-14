import { Badge, nullable } from '@taskany/bricks';
import { Comment } from '@prisma/client';
import cn from 'classnames';
import { CardInfo, Text, Dot } from '@taskany/bricks/harmony';

import { InterviewStatusComment, interviewStatusLabels } from '../../utils/dictionaries';
import { getInterviewChip } from '../helpers';
import { InterviewStatusTagPalette } from '../../utils/tagPalette';
import { Link } from '../Link';
import s from '../CommentView/CommentView.module.css';

import { tr } from './InterviewStatusCommentCard.i18n';

export const InterviewStatusColors: Record<InterviewStatusComment, string> = {
    [InterviewStatusComment.HIRE]: s.CardInfoHeaderHire,
    [InterviewStatusComment.NO_HIRE]: s.CardInfoHeaderNoHire,
};

interface InterviewStatusCommentCardProps extends React.HTMLAttributes<HTMLDivElement> {
    name: string;
    timeAgo: string;
    comment: Comment;
    userByEmailLink: string;
}

export const InterviewStatusCommentCard: React.FC<InterviewStatusCommentCardProps> = ({
    name,
    timeAgo,
    comment,
    userByEmailLink,
}) => {
    const interviewStatusChip = getInterviewChip(comment);

    return (
        <CardInfo className={cn(s.CardInfo, InterviewStatusColors[interviewStatusChip])}>
            {nullable(comment.status, (state) => (
                <div className={s.CardHeaderInterviewStatus}>
                    <div className={s.CardHeaderInterviewStatusSubtitle}>
                        <Text size="l" weight="bold" className={s.CardHeaderSectionName}>
                            {tr('Interview status: ')}
                        </Text>
                        <Badge size="l" color={InterviewStatusTagPalette[state]}>
                            {interviewStatusLabels[state]}
                        </Badge>
                    </div>
                    <div className={s.CardHeaderInterviewStatusSubtitle}>
                        <Dot size="s" color={InterviewStatusTagPalette[state]} />
                        {nullable(name, (n) => (
                            <>
                                <Text size="xs" color={InterviewStatusColors[interviewStatusChip]} weight="bold">
                                    <Link href={userByEmailLink} inline target="_blank">
                                        {n}
                                    </Link>
                                </Text>
                                <span>—</span>
                                <Text size="xs" color={InterviewStatusColors[interviewStatusChip]}>
                                    {timeAgo}
                                </Text>
                            </>
                        ))}
                    </div>
                </div>
            ))}
        </CardInfo>
    );
};
