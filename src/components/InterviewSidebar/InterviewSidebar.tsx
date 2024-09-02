import { useRouter } from 'next/router';
import { nullable } from '@taskany/bricks';
import { Badge, User } from '@taskany/bricks/harmony';
import { IconBinOutline, IconEdit1Outline, IconKeyOutline } from '@taskany/icons';

import { useSession } from '../../contexts/appSettingsContext';
import { InterviewWithRelations } from '../../modules/interviewTypes';
import { SidebarBlock } from '../SidebarBlock/SidebarBlock';
import { accessChecks } from '../../modules/accessChecks';
import { Confirmation, useConfirmation } from '../Confirmation/Confirmation';
import { useInterviewRemoveMutation } from '../../modules/interviewHooks';
import { pageHrefs } from '../../utils/paths';
import { Link } from '../Link';
import { getAuthorLink } from '../../utils/user';

import s from './InterviewSidebar.module.css';
import { tr } from './InterviewSidebar.i18n';

interface InterviewSidebarProps {
    interview: InterviewWithRelations;
}

export const InterviewSidebar = ({ interview }: InterviewSidebarProps) => {
    const router = useRouter();
    const session = useSession();
    const canEditInterviews = session && accessChecks.interview.update(session, interview.hireStreamId).allowed;
    const canDeleteInterviews = session && accessChecks.interview.delete(session).allowed;
    const hasSections = interview.sections.length > 0;

    const interviewRemove = useInterviewRemoveMutation();

    const interviewRemoveConfirmation = useConfirmation({
        message: tr('Delete interview?'),
        onAgree: () =>
            interviewRemove.mutateAsync({ interviewId: interview.id }).then(() => {
                router.push({
                    pathname: pageHrefs.candidate(interview.candidateId),
                });
            }),
        destructive: true,
    });

    return (
        <>
            <div className={s.InterviewSidebar}>
                <SidebarBlock title="HR">
                    <Link href={getAuthorLink(interview.creator.email)} target="_blank">
                        <User name={interview.creator.name} email={interview.creator.email} />
                    </Link>
                </SidebarBlock>

                <div className={s.InterviewSidebarActions}>
                    {nullable(canEditInterviews, () => (
                        <Link href={pageHrefs.candidateInterviewUpdate(interview.candidateId, interview.id)}>
                            <Badge text={tr('Edit')} iconLeft={<IconEdit1Outline size="s" />} />
                        </Link>
                    ))}

                    {nullable(canEditInterviews, () => (
                        <Link href={pageHrefs.interviewAccess(interview.id)}>
                            <Badge text={tr('Restrict / allow access')} iconLeft={<IconKeyOutline size="s" />} />
                        </Link>
                    ))}

                    {nullable(canDeleteInterviews && !hasSections, () => (
                        <Badge
                            text={tr('Delete')}
                            iconLeft={<IconBinOutline size="s" />}
                            onClick={interviewRemoveConfirmation.show}
                        />
                    ))}
                </div>
            </div>

            <Confirmation {...interviewRemoveConfirmation.props} />
        </>
    );
};
