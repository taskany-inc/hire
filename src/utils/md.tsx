import {
    AnchorHTMLAttributes,
    BlockquoteHTMLAttributes,
    HTMLAttributes,
    ImgHTMLAttributes,
    LiHTMLAttributes,
    OlHTMLAttributes,
} from 'react';
import { Image, Link, Text } from '@taskany/bricks/harmony';

export const markdownComponents = {
    a: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => <Link {...props} target="_blank" view="inline" />,
    img: (props: ImgHTMLAttributes<HTMLImageElement>) => <Image {...props} />,
    ul: (props: HTMLAttributes<HTMLUListElement>) => <Text as="ul" {...props} />,
    ol: (props: OlHTMLAttributes<HTMLOListElement>) => <Text as="ol" {...props} />,
    li: (props: LiHTMLAttributes<HTMLLIElement>) => <Text as="li" {...props} />,
    h1: (props: HTMLAttributes<HTMLDivElement>) => <Text as="h1" {...props} />,
    h2: (props: HTMLAttributes<HTMLDivElement>) => <Text as="h2" {...props} />,
    h3: (props: HTMLAttributes<HTMLDivElement>) => <Text as="h3" {...props} />,
    h4: (props: HTMLAttributes<HTMLDivElement>) => <Text as="h4" {...props} />,
    h5: (props: HTMLAttributes<HTMLDivElement>) => <Text as="h5" {...props} />,
    h6: (props: HTMLAttributes<HTMLDivElement>) => <Text as="h6" {...props} />,
    p: (props: HTMLAttributes<HTMLDivElement>) => <Text as="p" {...props} />,
    strong: (props: HTMLAttributes<HTMLDivElement>) => <Text as="strong" {...props} />,
    blockquote: (props: BlockquoteHTMLAttributes<HTMLQuoteElement>) => <Text as="blockquote" {...props} />,
};
