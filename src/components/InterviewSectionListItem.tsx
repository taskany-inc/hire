import { nullable, UserPic } from '@taskany/bricks';
import { Card, CardInfo, CardContent } from '@taskany/bricks/harmony';
import cn from 'classnames';
import { HTMLAttributes } from 'react';

import {
    InterviewWithRelations,
    SectionWithSectionTypeAndInterviewerAndSolutionsRelations,
} from '../modules/interviewTypes';
import { useDistanceDate } from '../hooks/useDateFormat';
import config from '../config';
import { SectionStatus } from '../utils/dictionaries';

import { ActivityFeedItem } from './ActivityFeed';
import s from './CommentView/CommentView.module.css';
import { Circle } from './Circle';
import { Link } from './Link';
import { CardHeaderSection } from './CardHeaderSection/CardHeaderSection';
import { MarkdownRenderer } from './MarkdownRenderer/MarkdownRenderer';
import { getSectionChip } from './helpers';

const SectionStatusColors: Record<SectionStatus, string> = {
    [SectionStatus.HIRE]: s.CardInfoSectionHire,
    [SectionStatus.NO_HIRE]: s.CardInfoSectionNoHire,
    [SectionStatus.NEW]: s.CardInfoSectionNew,
};

interface Props extends HTMLAttributes<HTMLDivElement> {
    section: SectionWithSectionTypeAndInterviewerAndSolutionsRelations;
    interview: InterviewWithRelations;
    highlight?: boolean;
}

// TODO: disable return value linting
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function InterviewSectionListItem({ section, interview, className, highlight }: Props) {
    const userByEmailLink = `${config.sourceUsers.userByEmailLink}/${section.interviewer.email}`;
    const date = useDistanceDate(section.updatedAt);
    const sectionChip = getSectionChip(section);

    return (
        <>
            <ActivityFeedItem className={cn(s.CommentView, className)} id={`section-${section.id}`}>
                <Circle size={31}>
                    {nullable(userByEmailLink && section.interviewer, ({ email, name }) => (
                        <Link href={userByEmailLink} inline target="_blank">
                            <UserPic size={35} email={email} name={name} />
                        </Link>
                    ))}
                </Circle>
                <Card className={cn(s.CommentCard, { [s.CommentCard_highlighted]: highlight })}>
                    <CardInfo className={cn(s.CardInfo, SectionStatusColors[sectionChip])}>
                        {nullable(section, (data) => (
                            <CardHeaderSection
                                name={data.interviewer.name || data.interviewer.email}
                                timeAgo={date}
                                section={section}
                                interview={interview}
                            />
                        ))}
                    </CardInfo>
                    <CardContent view="transparent" className={s.CardComment}>
                        <MarkdownRenderer value={section.feedback ?? ''} />
                    </CardContent>
                </Card>
            </ActivityFeedItem>
        </>
    );
}
