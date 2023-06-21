import { CSSProperties, useRef, useState, VFC } from 'react';
import styled from 'styled-components';
import dynamic from 'next/dynamic';
import { Text, Md, FileIcon } from '@taskany/bricks';

import { PropsWithClassName } from '../types';

import { IconButton } from './IconButton';

const Popup = dynamic(() => import('@taskany/bricks/components/Popup'));

import { tr } from './components.i18n';

const StyledRootText = styled(Text)`
    word-break: break-word;
    display: flex;
    width: 70%;
    justify-content: space-between;
    align-items: end;
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

    return (
        <div style={{ minHeight, ...style }}>
            <StyledRootText as="div" className={className}>
                <Md>{value}</Md>
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
