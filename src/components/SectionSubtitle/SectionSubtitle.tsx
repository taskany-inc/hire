import { Text } from '@taskany/bricks';
import { gray10 } from '@taskany/colors';

import { SectionWithInterviewerRelation } from '../../modules/sectionTypes';
import { InlineDot } from '../InlineDot';
import { ExternalUserLink } from '../ExternalUserLink';
import { useFormatDateToLocaleString } from '../../hooks/useDateFormat';

import { tr } from './SectionSubtitle.i18n';

// TODO: find out return type
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function SectionSubtitle({ section }: { section: SectionWithInterviewerRelation }) {
    const sectionName: string = section.description ?? '';
    const date = useFormatDateToLocaleString(section.createdAt);

    return (
        <>
            {date}

            <InlineDot />

            <Text as="span" color={gray10}>
                {tr('Interviewer')}
                {'  '}
                <Text size="s" as="span">
                    <ExternalUserLink user={section.interviewer} />
                </Text>
            </Text>
            {sectionName.length > 0 && (
                <>
                    <InlineDot />

                    <Text size="s" as="span">
                        {sectionName}
                    </Text>
                </>
            )}
        </>
    );
}
