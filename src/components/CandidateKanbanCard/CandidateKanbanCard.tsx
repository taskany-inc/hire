import { ComponentProps, FC, HTMLAttributes, ReactNode } from 'react';
import {
    Dropdown,
    DropdownTrigger,
    KanbanCard,
    KanbanCardContent,
    KanbanCardContentItem,
    KanbanCardInfo,
    KanbanCardTitle,
    Text,
} from '@taskany/bricks/harmony';
import { nullable } from '@taskany/bricks';

import { useDistanceDate } from '../../hooks/useDateFormat';
import { pageHrefs } from '../../utils/paths';
import { InlineDot } from '../InlineDot';
import { ExternalUserLink } from '../ExternalUserLink';
import { SectionsProgress } from '../SectionsProgress/SectionsProgress';
import { Link } from '../Link';
import { Avatar } from '../Avatar';
import { getAuthorLink } from '../../utils/user';

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

const ReadOnlyDropdown = ({ children, label }: { children: ReactNode; label: string }) => {
    return (
        <Dropdown isOpen={false} arrow>
            <DropdownTrigger view="outline" label={label} readOnly>
                {children}
            </DropdownTrigger>
        </Dropdown>
    );
};

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
    const hrLink = getAuthorLink(hr.email);
    const date = useDistanceDate(createdAt);

    return (
        <KanbanCard {...rest}>
            <KanbanCardTitle>
                <Link href={pageHrefs.candidate(id)}>{title}</Link>
            </KanbanCardTitle>
            <KanbanCardInfo className={s.CandidateKanbanCardInfo}>
                <Text size="s">
                    <Link href={pageHrefs.interview(interviewId)}>#{interviewId}</Link>
                </Text>
                <InlineDot className={s.CandidateKanbanCardDot} />
                <Text size="s">
                    {tr('Created at')} {date}
                </Text>
            </KanbanCardInfo>
            <KanbanCardContent className={s.CandidateKanbanCardContentRow}>
                <KanbanCardContentItem>
                    <ReadOnlyDropdown label={tr('HR')}>
                        <Link href={hrLink} inline target="_blank">
                            <Avatar email={hr.email} name={hr.name} tooltip={hr.name || hr.email} ellipsis />
                        </Link>
                    </ReadOnlyDropdown>
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
