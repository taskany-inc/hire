import { Text, Dot } from '@taskany/bricks/harmony';
import { nullable } from '@taskany/bricks';

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
                <Text size="m">{date}</Text>
                <Dot className={s.SectionSubtitleDot} />
                <Text size="m" className={s.SectionSubtitle}>
                    {tr('Interviewer')}
                </Text>
                <ExternalUserLink user={section.interviewer} />
                <Dot className={s.SectionSubtitleDot} />
                {nullable(sectionName, () => (
                    <Text size="m">{sectionName}</Text>
                ))}
            </div>
        </>
    );
}
