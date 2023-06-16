import { FC, ReactNode } from 'react';
import { Text } from '@taskany/bricks';

import { PropsWithClassName } from '../../types';

export const CardContent: FC<PropsWithClassName & { children: ReactNode }> = ({ className, children }) => {
    return (
        <Text as="div" style={{ marginTop: 8 }} className={className}>
            {children}
        </Text>
    );
};
