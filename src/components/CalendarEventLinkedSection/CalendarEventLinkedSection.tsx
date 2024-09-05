import { Text } from '@taskany/bricks/harmony';

import { SectionWithInterviewRelation } from '../../modules/interviewTypes';
import { pageHrefs } from '../../utils/paths';
import { getFullSectionTitle } from '../helpers';
import { Link } from '../Link';

import { tr } from './CalendarEventLinkedSection.i18n';

export interface CalendarEventLinkedSectionProps {
    interviewSection?: SectionWithInterviewRelation | null;
    sectionTitleOnly?: boolean;
}

export function CalendarEventLinkedSection({ interviewSection, sectionTitleOnly }: CalendarEventLinkedSectionProps) {
    if (!interviewSection) {
        return <Text size="l">{tr('Free slot')}</Text>;
    }

    if (sectionTitleOnly) {
        return <Text size="xs">{getFullSectionTitle(interviewSection)}</Text>;
    }

    return (
        <>
            <Text size="l">
                {tr('Linked section')}:{' '}
                <Text size="s" as="span">
                    <Link href={pageHrefs.interviewSectionView(interviewSection.interviewId, interviewSection.id)}>
                        {getFullSectionTitle(interviewSection)}
                    </Link>
                </Text>
            </Text>
        </>
    );
}
