import { CSSProperties, useRef, useState, VFC } from 'react';
import styled from 'styled-components';
import { Text, Popup } from '@taskany/bricks';
import { IconFileOutline } from '@taskany/icons';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import remarkGFM from 'remark-gfm';
import remarkEmoji from 'remark-emoji';

import { PropsWithClassName } from '../../utils/types';
import { useAppSettingsContext } from '../../contexts/appSettingsContext';
import { IconButton } from '../IconButton';

import { tr } from './MarkdownRenderer.i18n';

const StyledRootText = styled(Text)`
    word-break: break-word;
    display: flex;
    width: 100%;
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
                                    wrapLongLines
                                    showLineNumbers={!isSafari}
                                    language={match[1]}
                                >
                                    {String(children).replace(/\n$/, '')}
                                </SyntaxHighlighter>
                            ) : (
                                <code style={{ whiteSpace: 'pre-wrap' }} {...props} className={className}>
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
                        <IconFileOutline size="s" />
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
