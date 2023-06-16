import { User } from '@prisma/client';
import { Event } from 'react-big-calendar';

import { SectionWithInterviewRelation } from '../../backend/modules/interview/interview-types';

export interface BigCalendarEvent extends Event {
    eventId: string;
    exceptionId?: string;
    allDay: false;
    title: string;
    start: Date;
    end: Date;
    description: string;
    isRecurrent: boolean;
    interviewSection: SectionWithInterviewRelation | null;
    creator: User | null;
}
