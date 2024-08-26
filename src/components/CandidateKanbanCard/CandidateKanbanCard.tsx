import { ComponentProps, FC, HTMLAttributes, ReactNode } from 'react';
import {
    KanbanCard,
    KanbanCardContent,
    KanbanCardContentItem,
    KanbanCardInfo,
    KanbanCardTitle,
    Link,
    Text,
} from '@taskany/bricks/harmony';
import { nullable } from '@taskany/bricks';

import { useDistanceDate } from '../../hooks/useDateFormat';
import { interviewStatusLabels } from '../../utils/dictionaries';
import { pageHrefs } from '../../utils/paths';
import { InlineDot } from '../InlineDot';
import { ExternalUserLink } from '../ExternalUserLink';
import { CommentView } from '../CommentView/CommentView';
import { CommentViewHeaderMini } from '../CommentViewHeader/CommentViewHeaderMini';

import { tr } from './CandidateKanbanCard.i18n';
import s from './CandidateKanbanCard.module.css';

interface CandidateKanbanCardCommentProps
    extends Pick<ComponentProps<typeof CommentView>, 'author' | 'status' | 'text'> {}

export const CandidateKanbanCardComment: FC<CandidateKanbanCardCommentProps> = ({ author, text, status }) => {
    return (
        <CommentView
            avatarSize="s"
            author={author}
            status={status}
            text={text}
            header={
                <CommentViewHeaderMini dot author={author} status={status}>
                    {nullable(status, (s) => (
                        <Text weight="bold">{interviewStatusLabels[s]}</Text>
                    ))}
                </CommentViewHeaderMini>
            }
        />
    );
};

interface CandidateKanbanCard extends Omit<HTMLAttributes<HTMLDivElement>, 'id'> {
    title: string;
    id: number;
    interviewId: number;
    createdAt: Date;
    hr: ComponentProps<typeof ExternalUserLink>['user'];
    comment?: ReactNode;
}

export const CandidateKanbanCard: FC<CandidateKanbanCard> = ({
    id,
    title,
    interviewId,
    hr,
    createdAt,
    comment,
    ...rest
}) => {
    const date = useDistanceDate(createdAt);

    return (
        <KanbanCard {...rest}>
            <KanbanCardTitle>
                <Link href={pageHrefs.candidate(id)}>{title}</Link>
            </KanbanCardTitle>
            <KanbanCardInfo className={s.CandidateKanbanCardInfo}>
                <Link href={pageHrefs.interview(interviewId)}>#{interviewId}</Link>
                <InlineDot className={s.CandidateKanbanCardDot} />
                {tr('Created at')} {date}
            </KanbanCardInfo>
            <KanbanCardContent className={s.CandidateKanbanCardContentRow}>
                <KanbanCardContentItem>
                    <Text as="span">
                        {tr('HR:')} <ExternalUserLink className={s.CandidateKanbanCardText_highlighted} user={hr} />
                    </Text>
                </KanbanCardContentItem>
            </KanbanCardContent>
            {nullable(comment, (commentNode) => (
                <KanbanCardContent className={s.CandidateKanbanCardComment}>
                    <KanbanCardContentItem>{commentNode}</KanbanCardContentItem>
                </KanbanCardContent>
            ))}
        </KanbanCard>
    );
};
