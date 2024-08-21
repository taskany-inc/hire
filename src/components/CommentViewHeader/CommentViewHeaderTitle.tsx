import { FC, ReactNode } from 'react';
import { nullable } from '@taskany/bricks';
import { Text } from '@taskany/bricks/harmony';

import { Link } from '../Link';

interface CommentViewHeaderTitleProps {
    children?: ReactNode;
    link?: string;
    onClick?: () => void;
}

export const CommentViewHeaderTitle: FC<CommentViewHeaderTitleProps> = ({ children, link, onClick }) => (
    <Text size="l" weight="bold">
        {nullable(
            link,
            (l) => (
                <Link onClick={onClick} href={l}>
                    {children}
                </Link>
            ),
            children,
        )}
    </Text>
);
