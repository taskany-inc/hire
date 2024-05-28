import { ReactNode, useMemo, useState } from 'react';
import { Button, HistoryRecord as HistoryRecordBricks, Text } from '@taskany/bricks/harmony';
import { IconDividerLineOutline } from '@taskany/icons';
import { nullable } from '@taskany/bricks';

import { useDistanceDate } from '../../hooks/useDateFormat';
import { HistoryAction, HistoryEvent, HistorySubject } from '../../modules/historyEventTypes';
import { Link } from '../Link';
import { pageHrefs } from '../../utils/paths';

import s from './HistoryRecord.module.css';
import { tr } from './HistoryRecord.i18n';

interface InterviewHistoryCardProps {
    event: HistoryEvent;
}

interface GenericChangeEventProps {
    subject: string;
    event: HistoryEvent;
}

const GenericChangeEvent = ({ subject, event }: GenericChangeEventProps) => {
    if (event.before) {
        return (
            <Text size="xs" weight="thin">
                {tr('has changed')} {subject} {tr('from')}{' '}
                <Text as="span" strike weight="bold">
                    {event.before}
                </Text>{' '}
                {tr('to')}{' '}
                <Text as="span" weight="bold">
                    {event.after}
                </Text>
            </Text>
        );
    }
    return (
        <Text size="xs" weight="thin">
            {tr('set')} {subject} {tr('to')}{' '}
            <Text as="span" weight="bold">
                {event.after}
            </Text>
        </Text>
    );
};

interface EventProps {
    event: HistoryEvent;
}

const InterviewAddSection = ({ event }: EventProps) => {
    const [sectionType, sectionId] = event.after?.split('.') ?? [];
    return (
        <Text size="xs" weight="thin">
            {tr('added section')}{' '}
            <Link href={pageHrefs.interviewSectionView(Number(event.subjectId), Number(sectionId))}>{sectionType}</Link>
        </Text>
    );
};

const InterviewSetStatus = ({ event }: EventProps) => <GenericChangeEvent subject={tr('status')} event={event} />;

const InterviewSetCandidateSelectedSection = ({ event }: EventProps) => (
    <Text size="xs" weight="thin">
        {tr('set')}{' '}
        <Link href={pageHrefs.interviewSectionView(Number(event.subjectId), Number(event.after))}>
            {tr('section')} {event.after}
        </Link>{' '}
        {tr('as selected by candidate')}
    </Text>
);

const InterviewAddOrRemoveSpecialAccessUser = ({ event }: EventProps) => {
    const translations: Record<string, string> = {
        add_restricted_user: tr('restricted access for'),
        remove_restricted_user: tr('removed access restriction from'),
        add_allowed_user: tr('allowed access for'),
        remove_allowed_user: tr('removed access from'),
    };
    const action = translations[event.action];
    const dotIndex = event.after?.indexOf('.') ?? 0;
    const userName = event.after?.slice(dotIndex + 1);
    return (
        <Text size="xs" weight="thin">
            {action} {userName}
        </Text>
    );
};

const interviewEventMap: Record<HistoryAction<HistorySubject.INTERVIEW>, (props: EventProps) => ReactNode> = {
    add_section: InterviewAddSection,
    set_status: InterviewSetStatus,
    set_candidate_selected_section: InterviewSetCandidateSelectedSection,
    add_restricted_user: InterviewAddOrRemoveSpecialAccessUser,
    remove_restricted_user: InterviewAddOrRemoveSpecialAccessUser,
    add_allowed_user: InterviewAddOrRemoveSpecialAccessUser,
    remove_allowed_user: InterviewAddOrRemoveSpecialAccessUser,
};

const SectionCancel = () => (
    <Text size="xs" weight="thin">
        {tr('canceled the section')}
    </Text>
);

const SectionSetHire = ({ event }: EventProps) => <GenericChangeEvent subject={tr('hire status')} event={event} />;

const SectionSetGrade = ({ event }: EventProps) => <GenericChangeEvent subject={tr('grade')} event={event} />;

const SectionSetFeedback = ({ event }: EventProps) => {
    const [visible, setVisible] = useState(false);
    return (
        <Text size="xs" weight="thin">
            <Text className={s.HistoryRecordFeedback}>
                {tr('updated the feedback')}{' '}
                <Button
                    style={{ display: 'inline-block' }}
                    size="xs"
                    iconLeft={<IconDividerLineOutline size="xs" />}
                    onClick={() => setVisible((v) => !v)}
                />
            </Text>
            {nullable(visible, () => (
                <>
                    {nullable(event.before, (before) => (
                        <Text weight="bold">
                            {tr('from')}:{' '}
                            <Text weight="thin" as="span">
                                {before}
                            </Text>
                        </Text>
                    ))}
                    <Text weight="bold">
                        {tr('to')}:{' '}
                        <Text weight="thin" as="span">
                            {event.after}
                        </Text>
                    </Text>
                </>
            ))}
        </Text>
    );
};

const AchievementsForSections = ({ event }: EventProps) => (
    <Text size="xs" weight="thin">
        {tr('got {amount} achievements for this and previous sections', { amount: String(event.after) })}
    </Text>
);

const sectionEventMap: Record<HistoryAction<HistorySubject.SECTION>, (props: EventProps) => ReactNode> = {
    cancel: SectionCancel,
    set_hire: SectionSetHire,
    set_grade: SectionSetGrade,
    set_feedback: SectionSetFeedback,
    get_achievement: AchievementsForSections,
};

export const HistoryRecord = ({ event }: InterviewHistoryCardProps) => {
    const date = useDistanceDate(event.createdAt);

    const EventComponent = useMemo(() => {
        if (event.subject === HistorySubject.INTERVIEW) {
            return interviewEventMap[event.action as HistoryAction<HistorySubject.INTERVIEW>];
        }
        if (event.subject === HistorySubject.SECTION) {
            return sectionEventMap[event.action as HistoryAction<HistorySubject.SECTION>];
        }
        return () => null;
    }, [event.action, event.subject]);

    return (
        <HistoryRecordBricks authors={[event.user]} title={event.user.name || event.user.email} date={date}>
            <EventComponent event={event} />
        </HistoryRecordBricks>
    );
};
