import { useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { nullable } from '@taskany/bricks';
import { Text } from '@taskany/bricks/harmony';
import { IconAttachmentOutline } from '@taskany/icons';

import { pageHrefs } from '../../utils/paths';
import { accessChecks } from '../../modules/accessChecks';
import { SectionWithRelationsAndResults } from '../../modules/sectionTypes';
import { useSession } from '../../contexts/appSettingsContext';
import { useSolutions } from '../../modules/solutionHooks';
import { SectionProblemSolutions } from '../SectionProblemSolutions/SectionProblemSolutions';
import { LayoutMain } from '../LayoutMain/LayoutMain';
import { CandidateNameSubtitle } from '../CandidateNameSubtitle/CandidateNameSubtitle';
import { SectionSubtitle } from '../SectionSubtitle/SectionSubtitle';
import { SectionResults } from '../SectionResults/SectionResults';
import { getSectionTitle } from '../helpers';
import { QueryResolver } from '../QueryResolver/QueryResolver';
import { DropdownMenuItem } from '../TagFilterDropdown';
import { SectionFeedback } from '../SectionFeedback/SectionFeedback';
import { SectionCancelationConfirmation } from '../SectionCancelationConfirmation/SectionCancelationConfirmation';
import { Link } from '../Link';

import { tr } from './Section.i18n';
import s from './Section.module.css';

interface SectionProps {
    section: SectionWithRelationsAndResults;
}

export const Section = ({ section }: SectionProps): JSX.Element => {
    const router = useRouter();
    const sectionId = Number(router.query.sectionId);
    const interviewId = Number(router.query.interviewId);
    const session = useSession();

    const [openCancelConfirmation, setOpenCancelConfirmation] = useState(false);

    const isEditable = session ? accessChecks.section.update(session, section).allowed : false;
    const isCancelable = session ? accessChecks.section.delete(session, section).allowed : false;

    const solutionsQuery = useSolutions({ sectionId: section.id });

    const pageTitle = section.isCanceled
        ? tr('Section with {name} canceled', {
              name: section.interview.candidate.name,
          })
        : getSectionTitle(section);

    const titleMenuItems = useMemo<DropdownMenuItem[]>(() => {
        const items: DropdownMenuItem[] = [
            {
                onClick: () => router.push(pageHrefs.interviewSectionHistory(interviewId, sectionId)),
                text: tr('History of changes'),
            },
        ];

        if (section.isCanceled) return items;

        if (isEditable) {
            items.push({
                onClick: () => router.push(pageHrefs.interviewSectionEdit(interviewId, sectionId)),
                text: tr('Edit'),
            });
        }

        if (isCancelable) {
            items.push({
                onClick: () => setOpenCancelConfirmation(true),
                text: tr('Delete'),
            });
        }

        return items;
    }, [section.isCanceled, interviewId, sectionId, isEditable, isCancelable, setOpenCancelConfirmation, router]);

    const {
        interview,
        sectionType: { hasTasks, showOtherGrades },
        passedSections,
    } = section;

    return (
        <LayoutMain pageTitle={pageTitle} titleMenuItems={titleMenuItems} backlink={pageHrefs.interview(interviewId)}>
            <div className={s.SectionTitleContainer}>
                <Text className={s.SectionTitle}>
                    {!section.isCanceled ? (
                        <SectionSubtitle section={section} />
                    ) : (
                        section.cancelComment && `${tr('Section canceled due to')} ${section.cancelComment}`
                    )}
                </Text>
                {!section.isCanceled && (
                    <>
                        <div className={s.SectionTitleContainer}>
                            <CandidateNameSubtitle name={interview.candidate.name} id={interview.candidate.id} />

                            {nullable(section.interview.cvId, (cvId) => (
                                <Text weight="bold" size="l">
                                    <Link href={pageHrefs.attach(cvId)} target="_blank">
                                        {tr('CV')} <IconAttachmentOutline size="s" />
                                    </Link>
                                </Text>
                            ))}
                        </div>

                        {nullable(showOtherGrades, () => (
                            <SectionResults passedSections={passedSections} />
                        ))}
                        <SectionFeedback
                            section={section}
                            isEditable={isEditable}
                            candidateId={interview.candidateId}
                            hasTasks={hasTasks}
                        />

                        {nullable(hasTasks, () => (
                            <QueryResolver queries={[solutionsQuery]}>
                                {([solutions]) => (
                                    <SectionProblemSolutions
                                        sectionId={sectionId}
                                        solutions={solutions}
                                        interviewId={interviewId}
                                        isEditable={isEditable}
                                    />
                                )}
                            </QueryResolver>
                        ))}
                    </>
                )}
            </div>

            <SectionCancelationConfirmation
                isOpen={openCancelConfirmation}
                onClose={() => setOpenCancelConfirmation(false)}
                sectionId={section.id}
                interviewId={interviewId}
                calendarSlotId={section.calendarSlotId}
            />
        </LayoutMain>
    );
};
