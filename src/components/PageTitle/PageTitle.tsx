import { FC, ReactNode } from 'react';
import { Text } from '@taskany/bricks/harmony';

import { Link } from '../Link';

interface PageTitleProps {
    gutter?: string;
    backlink?: string;
    children?: ReactNode;
}

export const PageTitle: FC<PageTitleProps> = ({ backlink, children }) => {
    return (
        <Text size="l" weight="bolder">
            {backlink ? <Link href={backlink}>{children}</Link> : children}
        </Text>
    );
};
