import { Text } from '@taskany/bricks';

import { CandidateWithVendorRelation } from '../../backend/modules/candidate/candidate-types';

type CandidateBIOType = {
    candidate: CandidateWithVendorRelation;
};

export const CandidateBIO = ({ candidate }: CandidateBIOType): JSX.Element => {
    return (
        <div style={{ marginBottom: 10 }}>
            {candidate.outstaffVendor?.title && (
                <Text size="s" color="textSecondary" as="p">
                    Employment: {candidate.outstaffVendor.title}
                </Text>
            )}
            {candidate.email && (
                <Text size="s" color="textSecondary" as="p">
                    E-mail: {candidate.email}
                </Text>
            )}
            {candidate.phone && (
                <Text size="s" color="textSecondary" as="p">
                    Tel: {candidate.phone}
                </Text>
            )}
        </div>
    );
};
