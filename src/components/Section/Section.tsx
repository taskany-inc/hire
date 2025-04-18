import { ReactNode } from 'react';
import { nullable } from '@taskany/bricks';
import { Text } from '@taskany/bricks/harmony';
import { IconAttachmentOutline } from '@taskany/icons';

import { pageHrefs } from '../../utils/paths';
import { accessChecks } from '../../modules/accessChecks';
import { SectionWithRelationsAndResults } from '../../modules/sectionTypes';
import { useSession } from '../../contexts/appSettingsContext';
import { SectionResults } from '../SectionResults/SectionResults';
import { SectionFeedback } from '../SectionFeedback/SectionFeedback';
import { Link } from '../Link';
import { SectionActivity } from '../SectionActivity/SectionActivity';

import { tr } from './Section.i18n';
import s from './Section.module.css';

interface SectionProps {
    section: SectionWithRelationsAndResults;
    title?: ReactNode;
    showAddProblemButton?: boolean;
}

export const Section = ({ section, title, showAddProblemButton }: SectionProps): JSX.Element => {
    const session = useSession();
    const isEditable = session ? accessChecks.section.update(session, section).allowed : false;

    const {
        interview,
        sectionType: { hasTasks, showOtherGrades },
        passedSections,
    } = section;

    return (
        <div className={s.SectionTitleContainer}>
            {title}
            {!section.isCanceled && (
                <>
                    <div className={s.SectionTitleContainer}>
                        {nullable(section.interview.cvId, (cvId) => (
                            <Text weight="semiBold" size="l">
                                <Link href={pageHrefs.attach(cvId)} target="_blank">
                                    {tr('CV')} <IconAttachmentOutline size="s" />
                                </Link>
                            </Text>
                        ))}
                    </div>

                    {nullable(showOtherGrades, () => (
                        <SectionResults className={s.SectionResults} passedSections={passedSections} gradeVisibility />
                    ))}

                    <SectionFeedback
                        showAddProblemButton={showAddProblemButton}
                        section={section}
                        isEditable={isEditable}
                        candidateId={interview.candidateId}
                        hasTasks={hasTasks}
                    />
                    <SectionActivity
                        interviewId={section.interviewId}
                        sectionId={section.id}
                        hasTasks={hasTasks}
                        isEditable={isEditable}
                    />
                </>
            )}
        </div>
    );
};
