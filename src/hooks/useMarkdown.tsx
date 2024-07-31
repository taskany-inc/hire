import { AnchorHTMLAttributes, DetailedHTMLProps, HTMLAttributes } from 'react';
import remarkEmoji from 'remark-emoji';
import { useRemarkSync, UseRemarkSyncOptions } from 'react-remark';
import { Image, Link, Text } from '@taskany/bricks/harmony';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';

import { markdownComponents } from '../utils/md';

const mdAndPlainUrls =
    /((\[.*\])?(\(|<))?((https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})(?:(\s?("|').*("|'))?))((\)|>)?)/gi;
const mdLiteralUrl = /((\[.*\])(\()(.*)((\)))|(<(.*)>))/i;
const toClearCharacters = '.,!]})>';

const cleanUrl = (url: string): string => {
    const trimURL = url.trim();

    let toDropFromEnd = url.length;

    while (toClearCharacters.includes(trimURL[toDropFromEnd - 1])) {
        toDropFromEnd -= 1;
    }

    return trimURL.slice(0, toDropFromEnd);
};

const ssrRenderOptions: UseRemarkSyncOptions = {
    remarkPlugins: [
        // @ts-ignore 'cause different types between plugin and `UseRemarkSyncOptions['remarkPlugins']`
        remarkEmoji,
        function plugin() {
            return (_, vFile) => {
                const VFileCtor = vFile.constructor;

                let changed = vFile.contents.slice().toString();

                // match all urls in content
                const matched = changed.matchAll(mdAndPlainUrls);
                const matchedArray: RegExpMatchArray[] = [];
                let current = matched.next();

                while (!current.done) {
                    matchedArray.push(current.value);
                    current = matched.next();
                }

                for (let i = matchedArray.length - 1; i >= 0; i -= 1) {
                    const match = matchedArray[i];
                    const [matchedString] = match;
                    const { index = 0 } = match;

                    if (!mdLiteralUrl.test(matchedString)) {
                        const cleanedUrl = cleanUrl(matchedString);
                        const mdLinkLiteral = `<${cleanedUrl}>`;
                        changed = `${changed.slice(0, index)}${mdLinkLiteral}${changed.slice(
                            index + cleanedUrl.length,
                            changed.length,
                        )}`;
                    }
                }

                // @ts-ignore 'cause `VFileCtor` type is `Function`
                return this.parse(new VFileCtor(changed));
            };
        },
    ],

    rehypeReactOptions: {
        components: {
            ...markdownComponents,
            a: ({ href, title, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) => {
                return <Link {...props} title={title} href={href} target="_blank" view="inline" />;
            },
            img: (props: React.ComponentProps<typeof Image>) => <Image {...props} />,
            p: ({ children }: React.PropsWithChildren) => {
                const childrenArray = !Array.isArray(children) ? [children] : children;
                return (
                    <Text as="p">
                        {childrenArray.map((c) => {
                            if (typeof c === 'string') {
                                return c
                                    .split('\n')
                                    .flatMap((n, i) => [n, <br key={i} />])
                                    .slice(0, -1);
                            }

                            return c;
                        })}
                    </Text>
                );
            },
            code: ({
                className,
                children,
                ref: _,
                ...props
            }: DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>) => {
                const match = /language-(\w+)/.exec(className || '');
                return match ? (
                    <SyntaxHighlighter {...props} style={vscDarkPlus} wrapLongLines language={match[1].toLowerCase()}>
                        {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                ) : (
                    <code style={{ whiteSpace: 'pre-wrap' }} {...props} className={className}>
                        {children}
                    </code>
                );
            },
        },
    },
};

export const useMarkdown = (string: string) => {
    return useRemarkSync(string, ssrRenderOptions);
};
