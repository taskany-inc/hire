import { NextRouter, useRouter } from 'next/router';

type UseQueryParamListReturn = [<Param extends string>(filter: Param) => string[], NextRouter];

export const useQueryParamList = (): UseQueryParamListReturn => {
    const router = useRouter();
    const getQueryList = <Param extends string>(filter: Param) =>
        router.query[filter] === undefined ? [] : [router.query[filter]].flat(1);

    return [getQueryList, router];
};
