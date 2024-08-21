import { ComponentProps, FC } from 'react';
import { InterviewStatus } from '@prisma/client';
import { State } from '@taskany/bricks/harmony';

import { InterviewStatusTagHarmonyPalette } from '../utils/tagPalette';
import { interviewStatusLabels } from '../utils/dictionaries';

interface InterviewHireStatePorps extends ComponentProps<typeof State> {
    status?: InterviewStatus;
}

export const InterviewHireState: FC<InterviewHireStatePorps> = ({ status, ...props }) => {
    if (!status) {
        return null;
    }

    return <State color={InterviewStatusTagHarmonyPalette[status]} title={interviewStatusLabels[status]} {...props} />;
};
