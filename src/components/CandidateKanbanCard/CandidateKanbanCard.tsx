import { ComponentProps, FC, HTMLAttributes } from 'react';
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
import { pageHrefs } from '../../utils/paths';
import { InlineDot } from '../InlineDot';
import { ExternalUserLink } from '../ExternalUserLink';
import { SectionsProgress } from '../SectionsProgress/SectionsProgress';

import { CandidateKanbanCardComment } from './CandidateKanbanCardComment';
import { tr } from './CandidateKanbanCard.i18n';
import s from './CandidateKanbanCard.module.css';

interface CandidateKanbanCard extends Omit<HTMLAttributes<HTMLDivElement>, 'id'> {
    title: string;
    id: number;
    interviewId: number;
    createdAt: Date;
    hr: ComponentProps<typeof ExternalUserLink>['user'];
    comment?: ComponentProps<typeof CandidateKanbanCardComment>;
    sections?: ComponentProps<typeof SectionsProgress>['sections'];
    gradeVisibility?: boolean;
}

export const CandidateKanbanCard: FC<CandidateKanbanCard> = ({
    id,
    title,
    interviewId,
    hr,
    createdAt,
    comment,
    sections,
    gradeVisibility,
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
                    <Text as="span">{tr('HR:')} </Text>
                    <Text size="m" as="span" className={s.CandidateKanbanCardText_highlighted}>
                        <ExternalUserLink user={hr} />
                    </Text>
                </KanbanCardContentItem>
            </KanbanCardContent>
            {nullable(sections, (sct) => (
                <KanbanCardContent className={s.CandidateKanbanCardComment}>
                    <KanbanCardContentItem>
                        <SectionsProgress sections={sct} gradeVisibility={gradeVisibility} />
                    </KanbanCardContentItem>
                </KanbanCardContent>
            ))}
            {nullable(comment, (props) => (
                <KanbanCardContent className={s.CandidateKanbanCardComment}>
                    <KanbanCardContentItem>
                        <CandidateKanbanCardComment {...props} />
                    </KanbanCardContentItem>
                </KanbanCardContent>
            ))}
        </KanbanCard>
    );
};
