export type Option = {
    text: string;
    value: number;
};

export type PropsWithClassName<T = unknown> = T & { className?: string };

export type EmptyObj = Record<string, never>;

export type AsyncVoidFunction = () => Promise<void>;

export type AsyncAnyFunction = () => Promise<any>;

/**
 * Pulls the prop type from `getServerSideProps`, similar to `InferGetServerSidePropsType` from next.
 * Needed because the standard utility breaks if the function contains `return { redirect: {} }`.
 */
export type InferServerSideProps<T extends (...args: any) => any> = Exclude<
    Awaited<ReturnType<T>>,
    { redirect: any }
>['props'];
