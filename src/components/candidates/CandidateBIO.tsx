import { Text } from '@taskany/bricks';

import { CandidateWithVendorRelation } from '../../backend/modules/candidate/candidate-types';

import { tr } from './candidates.i18n';

type CandidateBIOType = {
    candidate: CandidateWithVendorRelation;
};

export const CandidateBIO = ({ candidate }: CandidateBIOType): JSX.Element => {
    return (
        <div style={{ marginBottom: 10 }}>
            {candidate.outstaffVendor?.title && (
                <Text size="s" color="textSecondary">
                    {tr('Employment:')} {candidate.outstaffVendor.title}
                </Text>
            )}
            {candidate.email && (
                <Text size="s" color="textSecondary" as="p">
                    {tr('E-mail:')} {candidate.email}
                </Text>
            )}
            {candidate.phone && (
                <Text size="s" color="textSecondary" as="p">
                    {tr('Tel:')} {candidate.phone}
                </Text>
            )}
        </div>
    );
};
