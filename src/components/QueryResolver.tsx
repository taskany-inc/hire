import { ReactElement } from 'react';
import { UseQueryResult } from '@tanstack/react-query';
import { Text } from '@taskany/bricks';

import { Spinner } from './Spinner';

type QueryResolverProps<T extends [...unknown[]]> = {
    queries: [...{ [K in keyof T]: UseQueryResult<T[K]> }];
    children: (data: [...T]) => ReactElement;
};

export const QueryResolver = <T extends unknown[]>({ queries, children }: QueryResolverProps<T>) => {
    let error = false;
    let loading = false;
    const data: [...T] = [] as unknown as [...T];
    queries.forEach((query: UseQueryResult<unknown>) => {
        if (query.status === 'loading') {
            loading = true;
        }

        if (query.status === 'error') {
            error = true;
        }

        if (query.status === 'success') {
            data.push(query.data);
        }
    });

    if (loading) {
        return <Spinner />;
    }

    if (error) {
        if (queries.length === queries.filter(({ data }) => data).length) {
            queries.forEach((query: UseQueryResult<unknown>) => data.push(query.data));

            return children(data);
        }

        return <Text color="error">Getting data error</Text>;
    }

    return children(data);
};
