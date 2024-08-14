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
import { ComponentProps, FC, HTMLAttributes } from 'react';

import { useDistanceDate } from '../../hooks/useDateFormat';
import { pageHrefs } from '../../utils/paths';
import { InlineDot } from '../InlineDot';
import { ExternalUserLink } from '../ExternalUserLink';

import s from './CandidateKanbanCard.module.css';
import { tr } from './CandidateKanbanCard.i18n';

interface CandidateKanbanCard extends Omit<HTMLAttributes<HTMLDivElement>, 'id'> {
    title: string;
    id: number;
    interviewId: number;
    createdAt: Date;
    phone?: string | null;
    email?: string | null;
    employment?: string | null;
    hr: ComponentProps<typeof ExternalUserLink>['user'];
}

export const CandidateKanbanCard: FC<CandidateKanbanCard> = ({
    id,
    title,
    interviewId,
    hr,
    createdAt,
    phone,
    email,
    employment,
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
            {nullable(employment, (emp) => (
                <KanbanCardContent className={s.CandidateKanbanCardContentRow}>
                    <KanbanCardContentItem>
                        {tr('Employment:')}{' '}
                        <Text as="span" size="m" className={s.CandidateKanbanCardText_highlighted}>
                            {emp}
                        </Text>
                    </KanbanCardContentItem>
                </KanbanCardContent>
            ))}
            {nullable(email, (e) => (
                <KanbanCardContent className={s.CandidateKanbanCardContentRow}>
                    <KanbanCardContentItem>
                        {tr('Email:')}{' '}
                        <Text as="span" size="m" className={s.CandidateKanbanCardText_highlighted}>
                            {e}
                        </Text>
                    </KanbanCardContentItem>
                </KanbanCardContent>
            ))}
            {nullable(phone, (p) => (
                <KanbanCardContent className={s.CandidateKanbanCardContentRow}>
                    <KanbanCardContentItem>
                        {tr('Tel:')}{' '}
                        <Text as="span" size="m" className={s.CandidateKanbanCardText_highlighted}>
                            {p}
                        </Text>
                    </KanbanCardContentItem>
                </KanbanCardContent>
            ))}
        </KanbanCard>
    );
};
