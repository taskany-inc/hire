import { Text } from '@taskany/bricks/harmony';

import { symbols } from '../utils/symbols';

interface InlineDotProps {
    className?: string;
}

export const InlineDot = ({ className }: InlineDotProps) => (
    <Text className={className} size="xxs" as="span">
        {symbols.blackCircle}
    </Text>
);
