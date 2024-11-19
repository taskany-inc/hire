import { ComponentProps, useCallback, useState } from 'react';
import { useRouter } from 'next/router';
import { nullable } from '@taskany/bricks';
import { Badge, User } from '@taskany/bricks/harmony';
import { IconBinOutline, IconEdit1Outline, IconKeyOutline, IconIdOutline } from '@taskany/icons';

import { useSession } from '../../contexts/appSettingsContext';
import { InterviewWithRelations } from '../../modules/interviewTypes';
import { SidebarBlock } from '../SidebarBlock/SidebarBlock';
import { accessChecks } from '../../modules/accessChecks';
import { Confirmation, useConfirmation } from '../Confirmation/Confirmation';
import { useInterviewRemoveMutation, useInterviewUpdateMutation } from '../../modules/interviewHooks';
import { pageHrefs } from '../../utils/paths';
import { Link } from '../Link';
import { getAuthorLink } from '../../utils/user';
import { CandidateInterviewUpdatePopup } from '../CandidateInterviewUpdatePopup/CandidateInterviewUpdatePopup';
import { AddVacancyToInterview } from '../AddVacancyToInterview/AddVacancyToInterview';
import { Vacancy } from '../../modules/crewTypes';
import { VacancyInfoById } from '../VacancyInfo/VacancyInfo';
import { CvAttach } from '../CvAttach/CvAttach';
import { cvParsingResultToDescription } from '../../utils/aiAssistantUtils';

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
    const [showEditPopup, setShowEditPopup] = useState(false);

    const interviewRemove = useInterviewRemoveMutation();
    const interviewUpdateMutation = useInterviewUpdateMutation();

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

    const onAddVacancy = (vacancy: Vacancy) => {
        interviewUpdateMutation.mutate({ data: { interviewId: interview.id, crewVacancyId: vacancy.id } });
    };

    const onCvParse = useCallback<ComponentProps<typeof CvAttach>['onParse']>(
        (attach, parsedData) => {
            const newDescription = `${interview.description}${cvParsingResultToDescription(parsedData)}`;
            interviewUpdateMutation.mutate({
                data: { interviewId: interview.id, description: newDescription, cvAttachId: attach.id },
            });
        },
        [interview.id, interview.description, interviewUpdateMutation],
    );

    return (
        <>
            <div className={s.InterviewSidebar}>
                <SidebarBlock title="HR">
                    <Link href={getAuthorLink(interview.creator.email)} target="_blank">
                        <User name={interview.creator.name} email={interview.creator.email} />
                    </Link>
                </SidebarBlock>

                {nullable(interview.cv || canEditInterviews, () => (
                    <SidebarBlock title={tr('CV')}>
                        {nullable(
                            interview.cv,
                            (cv) => (
                                <Badge
                                    iconLeft={<IconIdOutline size="xs" />}
                                    text={
                                        <Link target="_blank" href={pageHrefs.attach(cv.id)}>
                                            {cv.filename}
                                        </Link>
                                    }
                                />
                            ),
                            nullable(canEditInterviews, () => (
                                <CvAttach
                                    candidateId={interview.candidateId}
                                    cvForInterviewId={interview.id}
                                    onParse={onCvParse}
                                />
                            )),
                        )}
                    </SidebarBlock>
                ))}

                {nullable(interview.crewVacancyId || canEditInterviews, () => (
                    <SidebarBlock title={tr('Vacancy')}>
                        {nullable(
                            interview.crewVacancyId,
                            (id) => (
                                <VacancyInfoById
                                    vacancyId={id}
                                    interviewId={interview.id}
                                    isEditable={!!canEditInterviews}
                                />
                            ),
                            nullable(canEditInterviews, () => <AddVacancyToInterview onSelect={onAddVacancy} />),
                        )}
                    </SidebarBlock>
                ))}

                <div className={s.InterviewSidebarActions}>
                    {nullable(canEditInterviews, () => (
                        <>
                            <Link onClick={() => setShowEditPopup(true)}>
                                <Badge text={tr('Edit')} iconLeft={<IconEdit1Outline size="s" />} />
                            </Link>

                            <Link href={pageHrefs.interviewAccess(interview.id)}>
                                <Badge text={tr('Restrict / allow access')} iconLeft={<IconKeyOutline size="s" />} />
                            </Link>
                        </>
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
            <CandidateInterviewUpdatePopup
                visible={showEditPopup}
                onClose={() => setShowEditPopup(false)}
                interview={interview}
            />
        </>
    );
};
