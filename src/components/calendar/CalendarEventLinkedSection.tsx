import { Link, Text } from '@taskany/bricks';

import { SectionWithInterviewRelation } from '../../backend/modules/interview/interview-types';
import { pageHrefs } from '../../utils/paths';
import { getFullSectionTitle } from '../sections/helpers';

export interface CalendarEventLinkedSectionProps {
    interviewSection?: SectionWithInterviewRelation | null;
    sectionTitleOnly?: boolean;
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function CalendarEventLinkedSection({ interviewSection, sectionTitleOnly }: CalendarEventLinkedSectionProps) {
    if (!interviewSection) {
        return <Text size="l">Free slot</Text>;
    }

    if (sectionTitleOnly) {
        return <Text size="xs">{getFullSectionTitle(interviewSection)}</Text>;
    }

    return (
        <>
            <Text size="l">Section:</Text>

            <Link inline href={pageHrefs.interviewSectionView(interviewSection.interviewId, interviewSection.id)}>
                {getFullSectionTitle(interviewSection)}
            </Link>
        </>
    );
}
