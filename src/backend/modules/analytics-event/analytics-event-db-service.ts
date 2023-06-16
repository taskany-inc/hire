import { prisma } from '../..';

import { AnalyticsEventData } from './analytics-event-types';

const createEvent = (event: AnalyticsEventData, authUserId: number) => {
    return prisma.analyticsEvent.create({ data: { ...event, authUserId } });
};

export const analyticsEventDbService = {
    createEvent,
};
