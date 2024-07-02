import { Text, Dot } from '@taskany/bricks/harmony';

import { SectionWithInterviewerRelation } from '../../modules/sectionTypes';
import { ExternalUserLink } from '../ExternalUserLink';
import { useFormatDateToLocaleString } from '../../hooks/useDateFormat';

import { tr } from './SectionSubtitle.i18n';
import s from './SectionSubtitle.module.css';

// TODO: find out return type
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function SectionSubtitle({ section }: { section: SectionWithInterviewerRelation }) {
    const sectionName: string = section.description ?? '';
    const date = useFormatDateToLocaleString(section.createdAt);

    return (
        <>
            <div className={s.SectionSubtitleWrapper}>
                {date}

                <Dot className={s.SectionSubtitleDot} />
                <Text color={s.SectionSubtitleText}>{tr('Interviewer')}</Text>

                <Text>
                    <ExternalUserLink user={section.interviewer} />
                </Text>

                <Dot className={s.SectionSubtitleDot} />

                <Text>{sectionName.length > 0 && sectionName}</Text>
            </div>
        </>
    );
}
