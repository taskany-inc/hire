import { CSSProperties, useRef, useState, VFC } from 'react';
import styled from 'styled-components';
import dynamic from 'next/dynamic';
import { Text, FileIcon } from '@taskany/bricks';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import remarkGFM from 'remark-gfm';
import remarkEmoji from 'remark-emoji';

import { PropsWithClassName } from '../types';
import { useAppSettingsContext } from '../contexts/app-settings-context';

import { IconButton } from './IconButton';
import { tr } from './components.i18n';

const Popup = dynamic(() => import('@taskany/bricks/components/Popup'));

const StyledRootText = styled(Text)`
    word-break: break-word;
    display: flex;
    width: 70%;
    justify-content: space-between;
    align-items: end;
`;

const StyledReactMarkdown = styled(ReactMarkdown)`
    display: flex;
    flex-direction: column;
`;

type MarkdownRendererProps = PropsWithClassName<{
    value: string;
    hasCopyButton?: boolean;
    minHeight?: string;
    style?: CSSProperties;
}>;

export const MarkdownRenderer: VFC<MarkdownRendererProps> = ({
    value,
    className = '',
    style,
    minHeight,

    hasCopyButton = false,
}) => {
    const [popupVisible, setPopupVisibility] = useState(false);
    const popupRef = useRef<HTMLButtonElement>(null);
    const isSafari = useAppSettingsContext().browser === 'safari';

    return (
        <div style={{ minHeight, ...style }}>
            <StyledRootText as="div" className={className}>
                <StyledReactMarkdown
                    remarkPlugins={[remarkGFM, remarkEmoji]}
                    components={{
                        code({ node, inline, className, children, ...props }) {
                            const match = /language-(\w+)/.exec(className || '');
                            return match ? (
                                <SyntaxHighlighter
                                    {...props}
                                    style={vscDarkPlus}
                                    showLineNumbers={!isSafari}
                                    language={match[1]}
                                >
                                    {String(children).replace(/\n$/, '')}
                                </SyntaxHighlighter>
                            ) : (
                                <code {...props} className={className}>
                                    {children}
                                </code>
                            );
                        },
                    }}
                >
                    {value}
                </StyledReactMarkdown>
                {hasCopyButton && (
                    <IconButton
                        ref={popupRef}
                        onMouseEnter={() => setPopupVisibility(true)}
                        onMouseLeave={() => setPopupVisibility(false)}
                        onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            navigator.clipboard.writeText(value);
                        }}
                    >
                        <FileIcon size="s" />
                        <Popup
                            tooltip
                            placement="bottom-start"
                            arrow={false}
                            reference={popupRef}
                            visible={popupVisible}
                        >
                            {tr('Copy')}
                        </Popup>
                    </IconButton>
                )}
            </StyledRootText>
        </div>
    );
};
