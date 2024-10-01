import { Text, Dot } from '@taskany/bricks/harmony';
import { nullable } from '@taskany/bricks';
import React from 'react';

import { SectionWithInterviewerRelation } from '../../modules/sectionTypes';
import { ExternalUserLink } from '../ExternalUserLink';
import { useFormatDateToLocaleString } from '../../hooks/useDateFormat';

import { tr } from './SectionSubtitle.i18n';
import s from './SectionSubtitle.module.css';

// TODO: find out return type
export function SectionSubtitle({ section }: { section: SectionWithInterviewerRelation }) {
    const sectionName: string = section.description ?? '';
    const date = useFormatDateToLocaleString(section.createdAt);

    return (
        <div className={s.SectionSubtitleWrapper}>
            <Text size="m">{date}</Text>
            <Dot className={s.SectionSubtitleDot} />
            <Text size="m" className={s.SectionSubtitle}>
                {tr('Interviewers:')}{' '}
                {section.interviewers.map((interviewer, i) => (
                    <React.Fragment key={interviewer.id}>
                        <ExternalUserLink user={interviewer} />
                        {nullable(i < section.interviewers.length - 1, () => ', ')}
                    </React.Fragment>
                ))}
            </Text>
            {nullable(sectionName, () => (
                <>
                    <Dot className={s.SectionSubtitleDot} />
                    <Text size="m">{sectionName}</Text>
                </>
            ))}
        </div>
    );
}
