import { prisma } from '../prisma';
import { MessageBody } from '../../modules/nodemailer';
import config from '../../config';

export const defaultJobDelay = config.worker.workerJobsDelay ? parseInt(config.worker.workerJobsDelay, 10) : 1000;

export enum jobState {
    scheduled = 'scheduled',
    pending = 'pending',
    completed = 'completed',
}

export interface JobDataMap {
    email: {
        data: MessageBody;
    };
}

export type JobKind = keyof JobDataMap;

interface CreateJobProps<K extends keyof JobDataMap> {
    data: JobDataMap[K];
    priority?: number;
    delay?: number;
    cron?: string;
}

export function createJob<K extends keyof JobDataMap>(
    kind: K,
    { data, priority, delay = defaultJobDelay, cron }: CreateJobProps<K>,
) {
    return prisma.job.create({
        data: {
            state: jobState.scheduled,
            data,
            kind,
            priority,
            delay,
            cron,
        },
    });
}

export function createEmailJob(data: MessageBody) {
    return createJob('email', { data: { data } });
}
