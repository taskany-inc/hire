import { EventWrapperProps } from 'react-big-calendar';
import styled from 'styled-components';

import { getTagColor } from '../../utils/tag-palette';

import { BigCalendarEvent } from './calendar-types';

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

    &.rbc-event-label {
        display: none;
    }
`;
