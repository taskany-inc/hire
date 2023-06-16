import { useRef } from 'react';

class PendingPromiseInterrupted extends Error {
    constructor() {
        super('Pending Promise was interrupted by another Promise start');
    }
}

interface PendingPromiseController<S> {
    resolve: (value: S) => void;
    reject: (reason?: PendingPromiseInterrupted | unknown) => void;
}

export type StartPromise<S> = () => Promise<S>;
export type ResolvePromise<S> = (value: S) => void;
export type RejectPomise = (reason?: unknown) => void;

export function usePromiseResolver<S>(): [StartPromise<S>, ResolvePromise<S>, RejectPomise] {
    const pendingPromiseRef = useRef<PendingPromiseController<S> | null>(null);

    const startPromise: StartPromise<S> = (): Promise<S> => {
        return new Promise((resolve, reject) => {
            if (pendingPromiseRef.current) {
                pendingPromiseRef.current.reject(new PendingPromiseInterrupted());
            }

            pendingPromiseRef.current = { resolve, reject };
        });
    };

    const resolvePromise: ResolvePromise<S> = (value: S) => {
        if (pendingPromiseRef.current) {
            pendingPromiseRef.current.resolve(value);
            pendingPromiseRef.current = null;
        }
    };

    const rejectPromise: RejectPomise = (reason?: unknown) => {
        if (pendingPromiseRef.current) {
            pendingPromiseRef.current.reject(reason);
            pendingPromiseRef.current = null;
        }
    };

    return [startPromise, resolvePromise, rejectPromise];
}
