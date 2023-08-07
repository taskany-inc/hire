import { Prisma } from '@prisma/client';

import { tr } from './utils.i18n';

import { ErrorWithStatus } from '.';

const defaultStatus = 500;
const defaultError = tr('Something unexpected happened');

export const parseError = (error: unknown): { status: number; message: string } => {
    if (
        error instanceof Prisma.PrismaClientKnownRequestError ||
        error instanceof Prisma.PrismaClientUnknownRequestError ||
        error instanceof Prisma.PrismaClientRustPanicError ||
        error instanceof Prisma.PrismaClientInitializationError ||
        error instanceof Prisma.PrismaClientValidationError
    ) {
        return { status: defaultStatus, message: error.message };
    }

    if (error instanceof ErrorWithStatus) {
        return { status: error.statusCode, message: error.message };
    }

    if (error instanceof Error) {
        return { status: defaultStatus, message: error.message };
    }

    if (typeof error === 'string') {
        return { status: defaultStatus, message: error };
    }

    return { status: defaultStatus, message: defaultError };
};
