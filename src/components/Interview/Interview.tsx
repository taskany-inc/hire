import { useMemo, FC } from 'react';
import { useRouter } from 'next/router';
import { nullable, Text } from '@taskany/bricks';
import { gapS, gray10 } from '@taskany/colors';
import styled from 'styled-components';
import { RejectReason, SectionType } from '@prisma/client';

import { pageHrefs } from '../../utils/paths';
import { InterviewWithRelations } from '../../modules/interviewTypes';
import { useInterviewRemoveMutation } from '../../modules/interviewHooks';
import { useSession } from '../../contexts/appSettingsContext';
import { accessChecks } from '../../modules/accessChecks';
import { Confirmation, useConfirmation } from '../Confirmation/Confirmation';
import { Stack } from '../Stack';
import { InlineDot } from '../InlineDot';
import { MarkdownRenderer } from '../MarkdownRenderer/MarkdownRenderer';
import { AssignSectionDropdownButton } from '../AssignSectionDropdownButton/AssignSectionDropdownButton';
import { LayoutMain } from '../LayoutMain/LayoutMain';
import { DropdownMenuItem } from '../TagFilterDropdown';
import { InterviewSectionListItem } from '../InterviewSectionListItem';
import { InterviewTags } from '../InterviewTags';
import { ExternalUserLink } from '../ExternalUserLink';
import { useDistanceDate } from '../../hooks/useDateFormat';
import { Link } from '../Link';
import { VacancyInfoById } from '../VacancyInfo/VacancyInfo';
import { Comment } from '../Comment/Comment';
import InterviewCommentCreateForm from '../InterviewCommentCreationForm/InterviewCommentCreationForm';

import { tr } from './Interview.i18n';
import s from './Interview.module.css';

interface InterviewProps {
    interview: InterviewWithRelations;
    sectionTypes: SectionType[];
    rejectReasons: RejectReason[];
}

const StyledTitle = styled(Text)`
    margin-top: 50px;
    display: flex;
    margin-bottom: 40px;
    align-items: center;
    gap: 5px;
`;

export const Interview: FC<InterviewProps> = ({ interview, sectionTypes, rejectReasons }) => {
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
        const canReadInterviewHistory = session && accessChecks.interview.readOne(session, interview).allowed;
        const hasSections = interview.sections.length > 0;

        const items: DropdownMenuItem[] = [];

        if (canReadInterviewHistory) {
            items.push({
                onClick: () => router.push(pageHrefs.interviewHistory(interview.id)),
                text: tr('History of changes'),
            });
        }

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
            <Text size="s" as="div" style={{ paddingTop: gapS, paddingBottom: gapS }}>
                #{interview.id}
                <Text size="m" as="span" color={gray10}>
                    <InlineDot />
                    {tr('HR')} <ExternalUserLink user={interview.creator} />
                </Text>
                <Text size="s" as="span" color={gray10}>
                    <InlineDot />
                    {tr('Created at')} {date}
                </Text>
                <InterviewTags interview={interview} />
                <Text size="s" as="p" style={{ marginTop: gapS }}>
                    {interview.statusComment}
                </Text>
                {interview.description && <MarkdownRenderer value={interview.description} />}
                {nullable(interview.cv, (cv) => (
                    <Text>
                        {tr('CV:')}{' '}
                        <Link target="_blank" href={pageHrefs.attach(cv.id)}>
                            {cv.filename}
                        </Link>
                    </Text>
                ))}
            </Text>
            <Stack direction="column" gap={gapS}>
                {nullable(interview.crewVacancyId, (vacancyId) => (
                    <VacancyInfoById vacancyId={vacancyId} />
                ))}
                {canCreateSections && (
                    <AssignSectionDropdownButton interviewId={interviewId} sectionTypes={sectionTypes} />
                )}
                <StyledTitle size="xl">{tr('Activity Feed')}</StyledTitle>

                <div className={s.InterviewCommentWrapper}>
                    {nullable(interview.activityFeed, (activityFeed) =>
                        activityFeed.map((item) =>
                            item.type === 'comment' ? (
                                <Comment
                                    key={`comment - ${item.value.id}`}
                                    comment={item.value}
                                    status={item.value.status ?? undefined}
                                />
                            ) : (
                                <InterviewSectionListItem
                                    key={`section-${item.value.id}`}
                                    section={item.value}
                                    interview={interview}
                                />
                            ),
                        ),
                    )}
                    <InterviewCommentCreateForm interview={interview} rejectReasons={rejectReasons} />
                </div>
            </Stack>

            <Confirmation {...interviewRemoveConfirmation.props} />
        </LayoutMain>
    );
};
