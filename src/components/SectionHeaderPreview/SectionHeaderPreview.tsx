import React, { FC } from 'react';
import { Badge, Dropdown, DropdownTrigger, Text, User, UserGroup } from '@taskany/bricks/harmony';
import { nullable } from '@taskany/bricks';
import cn from 'classnames';

import { PageTitle } from '../PageTitle/PageTitle';
import { SectionWithRelationsAndResults } from '../../modules/sectionTypes';
import { useDistanceDate } from '../../hooks/useDateFormat';
import { interviewStatusLabels, sectionStatusToCommentStatus } from '../../utils/dictionaries';
import { SectionStatusTagPalette } from '../../utils/tagPalette';
import { getCommentStatus } from '../InterviewSectionListItem/InterviewSectionListItem';

import s from './SectionHeaderPreview.module.css';
import { tr } from './SectionHeaderPreview.i18n';

const Separator: React.FC = () => <div className={s.Separator} />;

interface SectionHeaderPreviewProps {
    pageTitle: string;
    section: SectionWithRelationsAndResults;
    href?: string;
    date: Date;
    readOnly?: boolean;
}

export const SectionHeaderPreview: FC<SectionHeaderPreviewProps> = ({ pageTitle, href, section, date, readOnly }) => {
    const { interview } = section;
    const timeAgo = useDistanceDate(date);
    const status = getCommentStatus(section);
    const sectionStatus = sectionStatusToCommentStatus[status];

    return (
        <>
            <div className={s.Header}>
                <div className={s.HeaderInfo_align_left}>
                    <div className={s.HeaderTitle}>
                        <Text as="span">#{section.id} — </Text>
                        {nullable(pageTitle, (title) => (
                            <PageTitle backlink={href} size="l">
                                {title}
                            </PageTitle>
                        ))}
                        <Badge
                            view="outline"
                            size="s"
                            weight="regular"
                            color={SectionStatusTagPalette[sectionStatus]}
                            text={interviewStatusLabels[status]}
                        />
                    </div>

                    <div className={s.HeaderStats}>
                        <div className={s.NameWrapper}>
                            <Dropdown>
                                <DropdownTrigger readOnly={readOnly}>
                                    <Text className={s.NameTitle} size="xs" weight="bold">
                                        {tr('Interviewer')}
                                    </Text>

                                    <UserGroup users={section.interviewers} />
                                </DropdownTrigger>
                            </Dropdown>
                        </div>
                        <Separator />
                        {nullable(interview, (i) => (
                            <div className={s.NameWrapper}>
                                <Dropdown>
                                    <DropdownTrigger readOnly={readOnly}>
                                        <Text size="xs" weight="bold" className={s.NameTitle}>
                                            {tr('Candidate')}
                                        </Text>
                                        <User
                                            size="s"
                                            email={i.candidate.email || i.candidate.name}
                                            name={i.candidate.name}
                                        />
                                    </DropdownTrigger>
                                </Dropdown>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className={s.HeaderInfo_align_right}>
                <div className={cn(s.UpdatedTime, s.PreviewTimeWrapper)}>
                    <Text size="xs">{timeAgo}</Text>
                </div>
            </div>
        </>
    );
};
