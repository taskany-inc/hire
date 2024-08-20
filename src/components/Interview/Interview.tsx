import { useMemo, FC } from 'react';
import { useRouter } from 'next/router';
import { nullable, Text } from '@taskany/bricks';
import { Card, CardContent, CardInfo } from '@taskany/bricks/harmony';
import { gray10 } from '@taskany/colors';
import { SectionType } from '@prisma/client';

import { pageHrefs } from '../../utils/paths';
import { InterviewWithRelations } from '../../modules/interviewTypes';
import { useInterviewRemoveMutation } from '../../modules/interviewHooks';
import { useSession } from '../../contexts/appSettingsContext';
import { accessChecks } from '../../modules/accessChecks';
import { Confirmation, useConfirmation } from '../Confirmation/Confirmation';
import { InlineDot } from '../InlineDot';
import { AssignSectionDropdownButton } from '../AssignSectionDropdownButton/AssignSectionDropdownButton';
import { LayoutMain } from '../LayoutMain/LayoutMain';
import { DropdownMenuItem } from '../TagFilterDropdown';
import { InterviewTags } from '../InterviewTags/InterviewTags';
import { ExternalUserLink } from '../ExternalUserLink';
import { useDistanceDate } from '../../hooks/useDateFormat';
import { Link } from '../Link';
import { VacancyInfoById } from '../VacancyInfo/VacancyInfo';
import Md from '../Md';
import { InterviewActivity } from '../InterviewActivity/InterviewActivity';
import { CardHeader } from '../CardHeader/CardHeader';

import s from './Interview.module.css';
import { tr } from './Interview.i18n';

interface InterviewProps {
    interview: InterviewWithRelations;
    sectionTypes: SectionType[];
}

export const Interview: FC<InterviewProps> = ({ interview, sectionTypes }) => {
    const router = useRouter();
    const session = useSession();
    const interviewId = Number(router.query.interviewId);
    const interviewRemove = useInterviewRemoveMutation();
    const date = useDistanceDate(interview.createdAt);

    const interviewRemoveConfirmation = useConfirmation({
        message: tr('Delete interview?'),
        onAgree: () =>
            interviewRemove.mutateAsync({ interviewId }).then(() => {
                router.push({
                    pathname: pageHrefs.candidate(interview.candidateId),
                });
            }),
        destructive: true,
    });

    const canCreateSections = session && accessChecks.section.create(session, interview.hireStreamId).allowed;

    const titleMenuItems = useMemo<DropdownMenuItem[]>(() => {
        const canEditInterviews = session && accessChecks.interview.update(session, interview.hireStreamId).allowed;
        const canDeleteInterviews = session && accessChecks.interview.delete(session).allowed;
        const hasSections = interview.sections.length > 0;

        const items: DropdownMenuItem[] = [];

        if (canEditInterviews) {
            items.push(
                {
                    onClick: () => router.push(pageHrefs.candidateInterviewUpdate(interview.candidate.id, interviewId)),
                    text: tr('Edit'),
                },
                {
                    onClick: () => router.push(pageHrefs.interviewAccess(interview.id)),
                    text: tr('Restrict / allow access'),
                },
            );
        }

        if (canDeleteInterviews) {
            if (hasSections) {
                items.push({
                    text: tr('Delete'),
                    hint: "Can't delete interviews with sections",
                    disabled: true,
                    onClick: () => {},
                });
            } else {
                items.push({
                    onClick: interviewRemoveConfirmation.show,
                    text: tr('Delete'),
                });
            }
        }

        return items;
    }, [session, interview, interviewId, interviewRemoveConfirmation.show, router]);

    return (
        <LayoutMain
            pageTitle={interview.candidate.name}
            titleMenuItems={titleMenuItems}
            headerGutter="0px"
            backlink={pageHrefs.candidate(interview.candidate.id)}
        >
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

                    {nullable(interview.description, (d) => (
                        <Md>{d}</Md>
                    ))}

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

            {canCreateSections && <AssignSectionDropdownButton interviewId={interviewId} sectionTypes={sectionTypes} />}

            <InterviewActivity interview={interview} />

            <Confirmation {...interviewRemoveConfirmation.props} />
        </LayoutMain>
    );
};
