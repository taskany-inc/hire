import { FC } from 'react';
import { nullable } from '@taskany/bricks';
import { Card, CardContent, CardInfo, Text } from '@taskany/bricks/harmony';
import { gray10 } from '@taskany/colors';
import { SectionType } from '@prisma/client';

import { pageHrefs } from '../../utils/paths';
import { InterviewWithRelations } from '../../modules/interviewTypes';
import { useSession } from '../../contexts/appSettingsContext';
import { accessChecks } from '../../modules/accessChecks';
import { InlineDot } from '../InlineDot';
import { AssignSectionDropdownButton } from '../AssignSectionDropdownButton/AssignSectionDropdownButton';
import { LayoutMain } from '../LayoutMain/LayoutMain';
import { InterviewTags } from '../InterviewTags/InterviewTags';
import { ExternalUserLink } from '../ExternalUserLink';
import { useDistanceDate } from '../../hooks/useDateFormat';
import { Link } from '../Link';
import { VacancyInfoById } from '../VacancyInfo/VacancyInfo';
import Md from '../Md';
import { InterviewActivity } from '../InterviewActivity/InterviewActivity';
import { CardHeader } from '../CardHeader/CardHeader';
import { InterviewSidebar } from '../InterviewSidebar/InterviewSidebar';

import s from './Interview.module.css';
import { tr } from './Interview.i18n';

interface InterviewProps {
    interview: InterviewWithRelations;
    sectionTypes: SectionType[];
}

export const Interview: FC<InterviewProps> = ({ interview, sectionTypes }) => {
    const session = useSession();
    const date = useDistanceDate(interview.createdAt);

    const canCreateSections = session && accessChecks.section.create(session, interview.hireStreamId).allowed;

    return (
        <LayoutMain
            pageTitle={interview.candidate.name}
            headerGutter="0px"
            backlink={pageHrefs.candidate(interview.candidate.id)}
        >
            <div className={s.InterviewContainer}>
                <div>
                    <Card className={s.InterviewCard}>
                        <CardInfo>
                            <CardHeader
                                title={
                                    <>
                                        <Text>#{interview.id}</Text>
                                        <InlineDot />
                                        <Text size="m" color={gray10}>
                                            {tr('HR')} <ExternalUserLink user={interview.creator} />
                                        </Text>
                                        <InlineDot />
                                        <Text size="s" color={gray10}>
                                            {tr('Created at')} {date}
                                        </Text>
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

                            {nullable(interview.cv, (cv) => (
                                <Text>
                                    {tr('CV:')}{' '}
                                    <Link target="_blank" href={pageHrefs.attach(cv.id)}>
                                        {cv.filename}
                                    </Link>
                                </Text>
                            ))}

                            {nullable(interview.crewVacancyId, (vacancyId) => (
                                <VacancyInfoById vacancyId={vacancyId} />
                            ))}
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
