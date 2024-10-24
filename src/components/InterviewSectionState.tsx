import { ComponentProps, FC } from 'react';
import { State } from '@taskany/bricks/harmony';

import { useSectionTypeColor } from './SectionFeedbackHireBadge/SectionFeedbackHireBadge';

interface InterviewSectionStatePorps extends ComponentProps<typeof State> {
    value: string;
}

export const InterviewSectionState: FC<InterviewSectionStatePorps> = ({ value, ...props }) => {
    const color = useSectionTypeColor(value);

    return <State color={color} {...props} />;
};
