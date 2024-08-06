import { ComponentType, useRef, useState } from 'react';
import { EventProps } from 'react-big-calendar';
import { Popup, Text } from '@taskany/bricks';

import { BigCalendarEvent } from '../../utils/calendar';
import { formatTime } from '../../utils/date';
import { symbols } from '../../utils/symbols';
import { CalendarEventLinkedSection } from '../CalendarEventLinkedSection/CalendarEventLinkedSection';

import s from './SlotCalendarEvent.module.css';

export type SlotCalendarEventProps = EventProps<BigCalendarEvent>;

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
            <div
                ref={popupRef}
                onMouseEnter={() => setPopupVisibility(true)}
                onMouseLeave={() => setPopupVisibility(false)}
                className={s.SlotCalendarEventTooltip}
            >
                {content}
            </div>
            <Popup tooltip placement="bottom-start" arrow={false} reference={popupRef} visible={popupVisible}>
                <Text size="xs">
                    {formatTime(start)} {symbols.emDash} {formatTime(end)}
                </Text>
                {content}
            </Popup>
        </>
    );
};
