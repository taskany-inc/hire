import { prisma } from '../utils/prisma';

import { CreateHistoryEvent, GetHistoryEvents, HistoryEvent, HistorySubject } from './historyEventTypes';

export const historyEventMethods = {
    create: async <T extends HistorySubject>(data: CreateHistoryEvent<T>) => {
        const { subjectId, ...restData } = data;
        return prisma.historyEvent.create({ data: { ...restData, subjectId: String(subjectId) } });
    },

    getHistoryEvents: async (data: GetHistoryEvents): Promise<HistoryEvent[]> => {
        const events = (await prisma.historyEvent.findMany({
            where: { subject: data.subject, subjectId: String(data.subjectId) },
            include: { user: { select: { name: true, email: true } } },
        })) as HistoryEvent[];
        return events;
    },
};
