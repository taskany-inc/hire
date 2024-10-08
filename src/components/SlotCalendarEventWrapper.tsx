import { EventWrapperProps } from 'react-big-calendar';
import styled from 'styled-components';

import { getTagColor } from '../utils/tagPalette';
import { BigCalendarEvent } from '../utils/calendar';

type SlotCalendarEventWrapperProps = EventWrapperProps<BigCalendarEvent>;

export const SlotCalendarEventWrapper = styled.span<SlotCalendarEventWrapperProps>`
    ${({ event }) => {
        if (!event.interviewSection) {
            return '';
        }
        const color =
            event.interviewSection.sectionType.eventColor || getTagColor(event.interviewSection.sectionTypeId);

        return `
            &>.rbc-event {
                border: 3px solid ${color};
            }
            `;
    }}

    ${({ event }) => {
        if (event.unavailableDueToWeekLimit || event.unavailableDueToDayLimit) {
            return `
            &>.rbc-event {
                background-color: var(--button-disable);
                color: var(--button-disabled-text);
            }
        `;
        }
    }}

    &.rbc-event-label {
        display: none;
    }
`;
