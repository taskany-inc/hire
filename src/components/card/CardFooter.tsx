import { FC, ReactNode } from 'react';
import { Text } from '@taskany/bricks';

import { PropsWithClassName } from '../../types';

export const CardFooter: FC<PropsWithClassName & { children: ReactNode }> = ({ className, children }) => {
    return (
        <Text size="s" as="p" style={{ marginTop: 8 }} className={className}>
            {children}
        </Text>
    );
};
