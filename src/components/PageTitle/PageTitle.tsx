import { FC, ReactNode } from 'react';
import { nullable } from '@taskany/bricks';
import { Text } from '@taskany/bricks/harmony';

import { Link } from '../Link';

interface PageTitleProps {
    backlink?: string;
    children?: ReactNode;
    size?: React.ComponentProps<typeof Text>['size'];
}

export const PageTitle: FC<PageTitleProps> = ({ backlink, children, size }) => {
    return (
        <Text size={size} weight="bolder">
            {nullable(
                backlink,
                (link) => (
                    <Link href={link}>{children}</Link>
                ),
                children,
            )}
        </Text>
    );
};
