import React from 'react';
import NextLink from 'next/link';
import { Link as LinkBricks } from '@taskany/bricks';

interface LinkProps {
    href?: string;
    target?: React.ComponentProps<typeof LinkBricks>['target'];
    className?: string;
    children?: React.ReactNode;
}

export const Link = ({ href, target, className, children }: LinkProps) => {
    if (!href) {
        return (
            <LinkBricks inline className={className}>
                {children}
            </LinkBricks>
        );
    }

    return (
        <NextLink href={href} passHref legacyBehavior>
            <LinkBricks inline target={target} className={className}>
                {children}
            </LinkBricks>
        </NextLink>
    );
};
