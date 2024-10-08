import { ComponentType, useRef, useState } from 'react';
import { EventProps } from 'react-big-calendar';
import { Popup, nullable } from '@taskany/bricks';
import { Alert, Text } from '@taskany/bricks/harmony';

import { BigCalendarEvent } from '../../utils/calendar';
import { formatTime } from '../../utils/date';
import { symbols } from '../../utils/symbols';
import { CalendarEventLinkedSection } from '../CalendarEventLinkedSection/CalendarEventLinkedSection';

import { tr } from './SlotCalendarEvent.i18n';
import s from './SlotCalendarEvent.module.css';

export type SlotCalendarEventProps = EventProps<BigCalendarEvent>;

export const SlotCalendarEvent: ComponentType<SlotCalendarEventProps> = ({ event, title }) => {
    const { start, end, creator, interviewSection } = event;

    const [popupVisible, setPopupVisibility] = useState(false);
    const popupRef = useRef<HTMLDivElement>(null);

    const content = (
        <>
            <Text size="xs">
                <Text>{creator?.name}</Text>

                <Text>{title}</Text>

                <CalendarEventLinkedSection interviewSection={interviewSection} sectionTitleOnly />
            </Text>

            {nullable(event.unavailableDueToWeekLimit, () => (
                <Alert
                    view="warning"
                    text={tr('Unavailable due to interviewer week limit in hire stream')}
                    className={s.SlotCalendarEventAlert}
                />
            ))}

            {nullable(event.unavailableDueToDayLimit, () => (
                <Alert
                    view="warning"
                    text={tr('Unavailable due to interviewer day limit in hire stream')}
                    className={s.SlotCalendarEventAlert}
                />
            ))}
        </>
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
