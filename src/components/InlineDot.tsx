import { VFC } from 'react';
import { Text } from '@taskany/bricks';

import { symbols } from '../utils/symbols';

export const InlineDot: VFC = () => (
    <Text size="xxs" as="span">
        {symbols.blackCircle}
    </Text>
);
