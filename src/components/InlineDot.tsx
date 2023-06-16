import { VFC } from 'react';
import { Text } from '@taskany/bricks';

import { symbols } from '../utils/symbols';

export const InlineDot: VFC = () => (
    <Text style={{ margin: '0 12px', verticalAlign: '12%' }} size="xxs" as="span">
        {symbols.blackCircle}
    </Text>
);
