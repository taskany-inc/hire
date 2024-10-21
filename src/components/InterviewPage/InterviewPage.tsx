import { FC } from 'react';
import { nullable } from '@taskany/bricks';
import { Card, CardContent, CardInfo, Text } from '@taskany/bricks/harmony';
import { SectionType } from '@prisma/client';

import { pageHrefs } from '../../utils/paths';
import { InterviewWithRelations } from '../../modules/interviewTypes';
import { useSession } from '../../contexts/appSettingsContext';
import { accessChecks } from '../../modules/accessChecks';
import { AssignSectionDropdownButton } from '../AssignSectionDropdownButton/AssignSectionDropdownButton';
import { LayoutMain } from '../LayoutMain/LayoutMain';
import { InterviewTags } from '../InterviewTags/InterviewTags';
import { useDistanceDate } from '../../hooks/useDateFormat';
import Md from '../Md';
import { InterviewActivity } from '../InterviewActivity/InterviewActivity';
import { CardHeader } from '../CardHeader/CardHeader';
import { InterviewSidebar } from '../InterviewSidebar/InterviewSidebar';
import { InterviewHeader } from '../InterviewHeader/InterviewHeader';

import s from './InterviewPage.module.css';
import { tr } from './InterviewPage.i18n';

interface InterviewProps {
    interview: InterviewWithRelations;
    sectionTypes: SectionType[];
}

export const InterviewPage: FC<InterviewProps> = ({ interview, sectionTypes }) => {
    const session = useSession();
    const date = useDistanceDate(interview.updatedAt);

    const canCreateSections = session && accessChecks.section.create(session, interview.hireStreamId).allowed;

    return (
        <LayoutMain pageTitle={interview.candidate.name} backlink={pageHrefs.candidate(interview.candidate.id)}>
            <InterviewHeader interview={interview} date={interview.updatedAt} />
            <div className={s.InterviewColumns}>
                <div className={s.InterviewMainColumn}>
                    <Card className={s.InterviewCard}>
                        <CardInfo>
                            <CardHeader
                                title={
                                    <>
                                        <Text size="m">{date}</Text>
                                    </>
                                }
                                chips={<InterviewTags interview={interview} />}
                            />
                        </CardInfo>

                        <CardContent className={s.InterviewCardContent}>
                            {nullable(interview.statusComment, (c) => (
                                <Text size="s">{c}</Text>
                            ))}

                            {nullable(
                                interview.description,
                                (d) => (
                                    <Md>{d}</Md>
                                ),
                                <Text size="s" className={s.InterviewCardNoDescription}>
                                    {tr('No description')}
                                </Text>,
                            )}
                        </CardContent>
                    </Card>

                    {canCreateSections && (
                        <AssignSectionDropdownButton interviewId={interview.id} sectionTypes={sectionTypes} />
                    )}

                    <InterviewActivity interview={interview} />
                </div>

                <InterviewSidebar interview={interview} />
            </div>
        </LayoutMain>
    );
};
