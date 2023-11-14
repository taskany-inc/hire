import { InterviewStatus, Prisma } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { RequestHandler } from 'next-connect';

import { AccessOptions } from '../modules/accessChecks';

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

export type Option = {
    text: string;
    value: number;
};

export type PropsWithClassName<T = unknown> = T & { className?: string };

export type AsyncAnyFunction = () => Promise<any>;

/**
 * Pulls the prop type from `getServerSideProps`, similar to `InferGetServerSidePropsType` from next.
 * Needed because the standard utility breaks if the function contains `return { redirect: {} }`.
 */
export type InferServerSideProps<T extends (...args: any) => any> = Exclude<
    Awaited<ReturnType<T>>,
    { redirect: any }
>['props'];
