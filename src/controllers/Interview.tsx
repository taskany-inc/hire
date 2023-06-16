import { useMemo, VFC } from 'react';
import { useRouter } from 'next/router';
import { InterviewStatus, RejectReason, SectionType } from '@prisma/client';
import { Text } from '@taskany/bricks';
import { gray10 } from '@taskany/colors';
import styled from 'styled-components';

import { pageHrefs } from '../utils/paths';
import { distanceDate } from '../utils/date';
import { InterviewWithRelations } from '../backend/modules/interview/interview-types';
import { useInterviewRemoveMutation } from '../hooks/interview-hooks';
import { Confirmation, useConfirmation } from '../components/Confirmation';
import { Stack } from '../components/layout/Stack';
import {
    HireOrRejectConfirmation,
    useHireOrRejectConfirmation,
} from '../components/interviews/HireOrReject/HireOrRejectConfirmation';
import { InlineDot } from '../components/InlineDot';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import { AssignSectionDropdownButton } from '../components/sections/AssignSectionDropdownButton';
import { LayoutMain } from '../components/layout/LayoutMain';
import { DropdownMenuItem } from '../components/TagFilterDropdown';
import { InterviewSectionListItem } from '../components/sections/InterviewSectionListItem';
import { InterviewTags } from '../components/interviews/InterviewTags';
import { useSession } from '../contexts/app-settings-context';
import { ReactionBar } from '../components/ReactionBar/ReactionBar';
import { ReactionType } from '../components/ReactionBar/types';
import { accessChecks } from '../backend/access/access-checks';
import { ExternalUserLink } from '../components/ExternalUserLink';

interface InterviewProps {
    interview: InterviewWithRelations;
    sectionTypes: SectionType[];
    reactions?: ReactionType[];
    rejectReasons: RejectReason[];
}
const StyledBAssignSectionDropdownButton = styled.div`
    padding-left: 40px;
`;

export const Interview: VFC<InterviewProps> = ({ interview, sectionTypes, reactions, rejectReasons }) => {
    const router = useRouter();
    const session = useSession();
    const interviewId = Number(router.query.interviewId);
    const interviewRemove = useInterviewRemoveMutation();

    const interviewRemoveConfirmation = useConfirmation({
        message: 'Delete interview?',
        onAgree: () =>
            interviewRemove.mutateAsync({ interviewId }).then(() => {
                router.push({
                    pathname: pageHrefs.candidate(interview.candidateId),
                });
            }),
        destructive: true,
    });

    const hireOrRejectConfirmation = useHireOrRejectConfirmation(interview.id, rejectReasons);

    const canCreateSections = session && accessChecks.section.create(session, interview.hireStreamId).allowed;

    const titleMenuItems = useMemo<DropdownMenuItem[]>(() => {
        const canEditInterviews = session && accessChecks.interview.update(session, interview.hireStreamId).allowed;
        const canDeleteInterviews = session && accessChecks.interview.delete(session).allowed;
        const canReadInterviewHistory = session && accessChecks.interview.readOne(session, interview).allowed;
        const hasSections = interview.sections.length > 0;
        const isVisibleHireOrRejected =
            session &&
            accessChecks.interview.update(session, interview.hireStreamId).allowed &&
            (interview.status === InterviewStatus.NEW || interview.status === InterviewStatus.IN_PROGRESS);

        const items: DropdownMenuItem[] = [];

        if (isVisibleHireOrRejected) {
            items.push(
                {
                    text: 'Hire',
                    onClick: () => hireOrRejectConfirmation.show(InterviewStatus.HIRED),
                },
                {
                    text: 'Reject',
                    onClick: () => hireOrRejectConfirmation.show(InterviewStatus.REJECTED),
                },
            );
        }

        if (canReadInterviewHistory) {
            items.push({
                onClick: () => router.push(pageHrefs.interviewHistory(interview.id)),
                text: 'History of changes',
            });
        }

        if (canEditInterviews) {
            items.push({
                onClick: () => router.push(pageHrefs.candidateInterviewUpdate(interview.candidate.id, interviewId)),
                text: 'Edit',
            });
        }

        if (canDeleteInterviews) {
            if (hasSections) {
                items.push({
                    text: 'Delete',
                    hint: 'Can\'t delete interviews with sections',
                    disabled: true,
                    onClick: () => {},
                });
            } else {
                items.push({ onClick: interviewRemoveConfirmation.show, text: 'Delete' });
            }
        }

        return items;
    }, [session, interview, hireOrRejectConfirmation, interviewId, interviewRemoveConfirmation.show, router]);

    return (
        <LayoutMain
            pageTitle={interview.candidate.name}
            titleMenuItems={titleMenuItems}
            headerGutter="0px"
            backlink={pageHrefs.candidate(interview.candidate.id)}
        >
            <Text size="s" as="div" style={{ padding: '10px 40px' }}>
                #{interview.id}
                <Text size="m" as="span" color={gray10}>
                    <InlineDot />
                    HR <ExternalUserLink user={interview.creator} />
                </Text>
                <Text size="s" as="span" color={gray10}>
                    <InlineDot />
                    Created at {distanceDate(interview.createdAt)}
                </Text>
                <InterviewTags interview={interview} />
                {Array.isArray(reactions) && (
                    <ReactionBar reactions={reactions} interviewId={interviewId} style={{ marginTop: 30 }} />
                )}
                <Text size="s" as="p" style={{ marginTop: '30px' }}>
                    {interview.statusComment}
                </Text>
                {interview.description && <MarkdownRenderer value={interview.description} />}
            </Text>
            <Stack direction="column" gap={25} style={{ marginTop: 20 }}>
                {canCreateSections && (
                    <StyledBAssignSectionDropdownButton>
                        <AssignSectionDropdownButton interviewId={interviewId} sectionTypes={sectionTypes} />
                    </StyledBAssignSectionDropdownButton>
                )}
                {interview.sections.length > 0 && (
                    <>
                        <Text size="xxl" style={{ marginTop: 30, marginLeft: 40 }}>
                            Interview sections
                        </Text>
                        {interview.sections.map((section) => (
                            <InterviewSectionListItem key={section.id} section={section} interview={interview} />
                        ))}
                    </>
                )}
            </Stack>

            <Confirmation {...interviewRemoveConfirmation.props} />
            <HireOrRejectConfirmation {...hireOrRejectConfirmation.props} />
        </LayoutMain>
    );
};
