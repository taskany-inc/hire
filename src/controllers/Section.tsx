import { useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { Text } from '@taskany/bricks';

import { pageHrefs } from '../utils/paths';
import { SectionSummary } from '../components/sections/SectionSummary';
import { SectionProblemSolutions } from '../components/sections/SectionProblemSolutions';
import { accessChecks } from '../backend/access/access-checks';
import { LayoutMain } from '../components/layout/LayoutMain';
import { CandidateNameSubtitle } from '../components/candidates/CandidateNameSubtitle';
import { Stack } from '../components/layout/Stack';
import { SectionSubtitle } from '../components/sections/SectionSubtitle';
import { SectionWithRelationsAndResults } from '../backend/modules/section/section-types';
import { useSession } from '../contexts/app-settings-context';
import { SectionResults } from '../components/sections/SectionResults';
import { getSectionTitle } from '../components/sections/helpers';
import { useSolutions } from '../hooks/solution-hooks';
import { QueryResolver } from '../components/QueryResolver';
import { DropdownMenuItem } from '../components/TagFilterDropdown';
import { SectionCancelationConfirmation } from '../components/sections/SectionCancelationConfirmation';

import { tr } from './controllers.i18n';

type SectionProps = {
    section: SectionWithRelationsAndResults;
};

export const Section = ({ section }: SectionProps): JSX.Element => {
    const router = useRouter();
    const sectionId = Number(router.query.sectionId);
    const interviewId = Number(router.query.interviewId);
    const session = useSession();

    const [openCancelConfirmation, setOpenCancelConfirmation] = useState(false);

    const isEditable = session ? accessChecks.section.update(session, section).allowed : false;
    const isCancelable = session ? accessChecks.section.delete(session, section).allowed : false;
    const canReadSolutions = session ? accessChecks.solution.read(session, section).allowed : false;

    const solutionsQuery = useSolutions({ sectionId: section.id }, { enabled: canReadSolutions });

    const pageTitle = section.isCanceled
        ? tr('Section with {section.interview.candidate.name} canceled', {
              name: section.interview.candidate.name,
          })
        : getSectionTitle(section);

    const titleMenuItems = useMemo<DropdownMenuItem[]>(() => {
        const items: DropdownMenuItem[] = [];

        if (section.isCanceled) return [];

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
        <LayoutMain
            pageTitle={pageTitle}
            titleMenuItems={titleMenuItems}
            backlink={pageHrefs.interview(interviewId)}
            headerGutter="0px"
        >
            <Stack direction="column" gap={20}>
                <Text size="s" style={{ marginLeft: 40 }}>
                    {!section.isCanceled ? (
                        <SectionSubtitle section={section} />
                    ) : (
                        section.cancelComment && `${tr('Section canceled due to')} ${section.cancelComment}`
                    )}
                </Text>
                {!section.isCanceled && (
                    <>
                        <CandidateNameSubtitle name={interview.candidate.name} id={interview.candidate.id} />

                        {showOtherGrades && <SectionResults passedSections={passedSections} />}
                        <SectionSummary
                            interview={interview}
                            section={section}
                            isEditable={isEditable}
                            hasTasks={hasTasks}
                        />
                        {hasTasks && canReadSolutions && (
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
                        )}
                    </>
                )}
            </Stack>

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
