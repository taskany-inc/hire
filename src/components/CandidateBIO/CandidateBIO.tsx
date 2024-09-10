import { Text } from '@taskany/bricks/harmony';

import { CandidateWithVendorRelation } from '../../modules/candidateTypes';

import { tr } from './CandidateBIO.i18n';

interface CandidateBIOType {
    candidate: CandidateWithVendorRelation;
}

export const CandidateBIO = ({ candidate }: CandidateBIOType): JSX.Element => {
    return (
        <div style={{ marginBottom: 10 }}>
            {candidate.outstaffVendor?.title && (
                <Text size="s">
                    {tr('Employment')}: {candidate.outstaffVendor.title}
                </Text>
            )}
            {candidate.email && (
                <Text size="s" as="p">
                    {tr('E-mail:')} {candidate.email}
                </Text>
            )}
            {candidate.phone && (
                <Text size="s" as="p">
                    {tr('Tel:')} {candidate.phone}
                </Text>
            )}
        </div>
    );
};
