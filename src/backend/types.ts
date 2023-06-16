import { InterviewStatus, Prisma } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { RequestHandler } from 'next-connect';

import { AccessOptions } from './access/access-checks';

type InferTypeFromArray<T> = T extends ArrayLike<infer U> ? U : never;

export type ExtractPrismaTypeFromArray<T extends (...args: any) => Promise<any>> = InferTypeFromArray<
    Prisma.PromiseReturnType<T>
>;

export interface PaginationParams {
    offset?: number;
    limit?: number;
}

export interface ApiEntityListSelectionParams extends PaginationParams {
    search?: string;
    orderBy?: string;
    orderDirection?: 'asc' | 'desc';
    statuses?: InterviewStatus[];
    hireStreamIds?: number[];
}

export type NextHandler = RequestHandler<NextApiRequest & { accessOptions?: AccessOptions }, NextApiResponse>;

export interface ApiEntityListResult<TData> {
    items: TData[];
    total: number;
    nextCursor?: number | null;
}
