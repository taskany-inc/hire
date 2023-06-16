import { ComponentType, useRef, useState } from 'react';
import { EventProps } from 'react-big-calendar';
import dynamic from 'next/dynamic';
import styled from 'styled-components';
import { Text } from '@taskany/bricks';

import { formatTime } from '../../utils/date';
import { symbols } from '../../utils/symbols';

import { BigCalendarEvent } from './calendar-types';
import { CalendarEventLinkedSection } from './CalendarEventLinkedSection';

const Popup = dynamic(() => import('@taskany/bricks/components/Popup'));

export type SlotCalendarEventProps = EventProps<BigCalendarEvent>;

const StyledTooltip = styled.div`
    width: 100%;
    height: 100%;
    background: transparent;
`;

export const SlotCalendarEvent: ComponentType<SlotCalendarEventProps> = ({ event, title }) => {
    const { start, end, creator, interviewSection } = event;

    const [popupVisible, setPopupVisibility] = useState(false);
    const popupRef = useRef<HTMLDivElement>(null);

    const content = (
        <div>
            <Text size="xs">{creator?.name}</Text>

            <Text color="textSecondary" size="xs">
                {title}
            </Text>
            <CalendarEventLinkedSection interviewSection={interviewSection} sectionTitleOnly />
        </div>
    );

    return (
        <>
            <StyledTooltip
                ref={popupRef}
                onMouseEnter={() => setPopupVisibility(true)}
                onMouseLeave={() => setPopupVisibility(false)}
            >
                {content}
            </StyledTooltip>
            <Popup tooltip placement="bottom-start" arrow={false} reference={popupRef} visible={popupVisible}>
                <Text size="xs">
                    {formatTime(start)} {symbols.emDash} {formatTime(end)}
                </Text>
                {content}
            </Popup>
        </>
    );
};
