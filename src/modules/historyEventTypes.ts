import { z } from 'zod';

export enum HistorySubject {
    INTERVIEW = 'INTERVIEW',
    SECTION = 'SECTION',
}

export interface HistoryEvents {
    [HistorySubject.INTERVIEW]:
        | 'add_section'
        | 'set_status'
        | 'set_candidate_selected_section'
        | 'add_restricted_user'
        | 'remove_restricted_user'
        | 'add_allowed_user'
        | 'remove_allowed_user';
    [HistorySubject.SECTION]: 'cancel' | 'set_hire' | 'set_grade' | 'set_feedback' | 'get_achievement';
}

export type HistoryAction<T extends HistorySubject> = HistoryEvents[T];

export const CreateHistoryEventSchema = z.object({
    userId: z.number(),
    subject: z.nativeEnum(HistorySubject),
    subjectId: z.union([z.string(), z.number()]),
    action: z.string(),
    before: z.string().optional(),
    after: z.string().optional(),
});
export type CreateHistoryEvent<T extends HistorySubject> = z.infer<typeof CreateHistoryEventSchema> & {
    subject: T;
    action: HistoryEvents[T];
};

export const GetHistoryEventsSchema = z.object({
    subject: z.nativeEnum(HistorySubject),
    subjectId: z.union([z.string(), z.number()]),
});
export type GetHistoryEvents = z.infer<typeof GetHistoryEventsSchema>;

export interface HistoryEvent<T extends HistorySubject = HistorySubject> {
    id: string;
    userId: number;
    subject: T;
    subjectId: string;
    action: HistoryEvents[T];
    before: string | null;
    after: string | null;
    createdAt: Date;
    user: { id: number; name: string | null; email: string };
}
