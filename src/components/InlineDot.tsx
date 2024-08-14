import { VFC } from 'react';
import { Text } from '@taskany/bricks';

import { symbols } from '../utils/symbols';

export const InlineDot: VFC<{ className?: string }> = ({ className }) => (
    <Text className={className} size="xxs" as="span">
        {symbols.blackCircle}
    </Text>
);
