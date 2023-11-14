import { prisma } from '../utils/prisma';

import { AnalyticsEventData } from './analyticsEventTypes';

const createEvent = (event: AnalyticsEventData, authUserId: number) => {
    return prisma.analyticsEvent.create({ data: { ...event, authUserId } });
};

export const analyticsEventMethods = {
    createEvent,
};
