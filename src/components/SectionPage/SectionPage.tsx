import { useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { Text } from '@taskany/bricks/harmony';

import { pageHrefs } from '../../utils/paths';
import { accessChecks } from '../../modules/accessChecks';
import { SectionWithRelationsAndResults } from '../../modules/sectionTypes';
import { useSession } from '../../contexts/appSettingsContext';
import { LayoutMain } from '../LayoutMain/LayoutMain';
import { getSectionTitle } from '../helpers';
import { TitleMenuItem } from '../TitleMenu/TitleMenu';
import { SectionCancelationConfirmation } from '../SectionCancelationConfirmation/SectionCancelationConfirmation';
import { Section } from '../Section/Section';
import { SectionSubtitle } from '../SectionSubtitle/SectionSubtitle';
import { CandidateNameSubtitle } from '../CandidateNameSubtitle/CandidateNameSubtitle';

import { tr } from './SectionPage.i18n';
import s from './SectionPage.module.css';

interface SectionPageProps {
    section: SectionWithRelationsAndResults;
}

export const SectionPage = ({ section }: SectionPageProps): JSX.Element => {
    const router = useRouter();
    const interviewId = Number(router.query.interviewId);
    const session = useSession();

    const [openCancelConfirmation, setOpenCancelConfirmation] = useState(false);

    const isEditable = session ? accessChecks.section.update(session, section).allowed : false;
    const isCancelable = session ? accessChecks.section.delete(session, section).allowed : false;

    const pageTitle = section.isCanceled
        ? tr('Section with {name} canceled', {
              name: section.interview.candidate.name,
          })
        : getSectionTitle(section);

    const titleMenuItems = useMemo<TitleMenuItem[]>(() => {
        const items: TitleMenuItem[] = [
            {
                onClick: () => router.push(pageHrefs.interviewSectionHistory(interviewId, section.id)),
                text: tr('History of changes'),
            },
        ];

        if (section.isCanceled) return items;

        if (isEditable) {
            items.push({
                onClick: () => router.push(pageHrefs.interviewSectionEdit(interviewId, section.id)),
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
    }, [section.isCanceled, interviewId, section.id, isEditable, isCancelable, setOpenCancelConfirmation, router]);

    return (
        <LayoutMain pageTitle={pageTitle} titleMenuItems={titleMenuItems} backlink={pageHrefs.interview(interviewId)}>
            <Section
                showAddProblemButton
                section={section}
                title={
                    <>
                        <Text className={s.SectionTitle}>
                            {!section.isCanceled ? (
                                <SectionSubtitle section={section} />
                            ) : (
                                section.cancelComment && `${tr('Section canceled due to')} ${section.cancelComment}`
                            )}
                        </Text>
                        <CandidateNameSubtitle
                            name={section.interview.candidate.name}
                            id={section.interview.candidate.id}
                        />
                    </>
                }
            />
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
