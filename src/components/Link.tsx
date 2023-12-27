import React from 'react';
import NextLink from 'next/link';
import { Link as LinkBricks } from '@taskany/bricks';

type LinkProps = React.ComponentProps<typeof LinkBricks> & { forwardRef?: React.Ref<HTMLAnchorElement> };

const NextLinkWrapper = ({ inline, forwardRef, as, ...props }: LinkProps & { href: string }) => <NextLink {...props} />;

export const Link = (props: LinkProps) => {
    if (!props.href) {
        return <LinkBricks inline {...props} />;
    }
    return <LinkBricks as={NextLinkWrapper} inline {...props} />;
};
