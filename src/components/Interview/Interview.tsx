import { useMemo, VFC } from 'react';
import { useRouter } from 'next/router';
import { InterviewStatus, RejectReason, SectionType } from '@prisma/client';
import { Text } from '@taskany/bricks';
import { gapS, gray10 } from '@taskany/colors';

import { pageHrefs } from '../../utils/paths';
import { distanceDate } from '../../utils/date';
import { InterviewWithRelations } from '../../modules/interviewTypes';
import { useInterviewRemoveMutation } from '../../modules/interviewHooks';
import { useSession } from '../../contexts/appSettingsContext';
import { accessChecks } from '../../modules/accessChecks';
import { ReactionType } from '../../modules/reactionTypes';
import { Confirmation, useConfirmation } from '../Confirmation/Confirmation';
import { Stack } from '../Stack';
import {
    HireOrRejectConfirmation,
    useHireOrRejectConfirmation,
} from '../HireOrRejectConfirmation/HireOrRejectConfirmation';
import { InlineDot } from '../InlineDot';
import { MarkdownRenderer } from '../MarkdownRenderer/MarkdownRenderer';
import { AssignSectionDropdownButton } from '../AssignSectionDropdownButton/AssignSectionDropdownButton';
import { LayoutMain } from '../LayoutMain';
import { DropdownMenuItem } from '../TagFilterDropdown';
import { InterviewSectionListItem } from '../InterviewSectionListItem';
import { InterviewTags } from '../InterviewTags';
import { ReactionBar } from '../ReactionBar';
import { ExternalUserLink } from '../ExternalUserLink';

import { tr } from './Interview.i18n';

interface InterviewProps {
    interview: InterviewWithRelations;
    sectionTypes: SectionType[];
    reactions?: ReactionType[];
    rejectReasons: RejectReason[];
}

export const Interview: VFC<InterviewProps> = ({ interview, sectionTypes, reactions, rejectReasons }) => {
    const router = useRouter();
    const session = useSession();
    const interviewId = Number(router.query.interviewId);
    const interviewRemove = useInterviewRemoveMutation();

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
                    text: tr('Hire'),
                    onClick: () => hireOrRejectConfirmation.show(InterviewStatus.HIRED),
                },
                {
                    text: tr('Reject'),
                    onClick: () => hireOrRejectConfirmation.show(InterviewStatus.REJECTED),
                },
            );
        }

        if (canReadInterviewHistory) {
            items.push({
                onClick: () => router.push(pageHrefs.interviewHistory(interview.id)),
                text: tr('History of changes'),
            });
        }

        if (canEditInterviews) {
            items.push({
                onClick: () => router.push(pageHrefs.candidateInterviewUpdate(interview.candidate.id, interviewId)),
                text: tr('Edit'),
            });
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
    }, [session, interview, hireOrRejectConfirmation, interviewId, interviewRemoveConfirmation.show, router]);

    return (
        <LayoutMain
            pageTitle={interview.candidate.name}
            titleMenuItems={titleMenuItems}
            headerGutter="0px"
            backlink={pageHrefs.candidate(interview.candidate.id)}
        >
            <Text size="s" as="div" style={{ paddingTop: gapS }}>
                #{interview.id}
                <Text size="m" as="span" color={gray10}>
                    <InlineDot />
                    {tr('HR')} <ExternalUserLink user={interview.creator} />
                </Text>
                <Text size="s" as="span" color={gray10}>
                    <InlineDot />
                    {tr('Created at')} {distanceDate(interview.createdAt)}
                </Text>
                <InterviewTags interview={interview} />
                {Array.isArray(reactions) && (
                    <ReactionBar reactions={reactions} interviewId={interviewId} style={{ marginTop: 30 }} />
                )}
                <Text size="s" as="p" style={{ marginTop: gapS }}>
                    {interview.statusComment}
                </Text>
                {interview.description && <MarkdownRenderer value={interview.description} />}
            </Text>
            <Stack direction="column">
                {canCreateSections && (
                    <AssignSectionDropdownButton interviewId={interviewId} sectionTypes={sectionTypes} />
                )}
                {interview.sections.length > 0 && (
                    <>
                        <Text size="xxl" style={{ marginTop: 30 }}>
                            {tr('Interview sections')}
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
