import React, { FC } from 'react';
import router from 'next/router';
import { IconEdit1Outline } from '@taskany/icons';
import { Badge, Dropdown, DropdownTrigger, Text, User, UserGroup, Button } from '@taskany/bricks/harmony';
import { nullable } from '@taskany/bricks';

import { accessChecks } from '../../modules/accessChecks';
import { useSession } from '../../contexts/appSettingsContext';
import { pageHrefs } from '../../utils/paths';
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
    const session = useSession();
    const timeAgo = useDistanceDate(date);
    const status = getCommentStatus(section);
    const sectionStatus = sectionStatusToCommentStatus[status];
    const isEditable = session ? accessChecks.section.update(session, section).allowed : false;

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
                                    <Text className={s.NameTitle} size="xs" weight="semiBold">
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
                                        <Text size="xs" weight="semiBold" className={s.NameTitle}>
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
                <div className={s.Wrapper}>
                    {nullable(isEditable, () => (
                        <div className={s.HeaderInfo_align_right}>
                            <Button
                                text={tr('Edit')}
                                iconLeft={<IconEdit1Outline size="xs" />}
                                onClick={() =>
                                    router.push(pageHrefs.interviewSectionEdit(section.interviewId, section.id))
                                }
                            />
                            <Text className={s.TimeAgo} size="s">
                                updated {timeAgo}
                            </Text>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};
