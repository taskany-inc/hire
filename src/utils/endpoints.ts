const SERVER_URL =
    process.env.NODE_ENV === 'development'
        ? '' // dev enviroment will use proxy settings from 'src/setupProxy.js'
        : '';

const API_PREFIX = '/api';

// TODO: fix false positive
// eslint-disable-next-line no-shadow
export enum Endpoints {
    ATTACH = '/attach/{id}',
}

const replaceId = (endpoint: Endpoints, id: string) => endpoint.replace('{id}', id);

const addPrefixes = (url: string): string => `${SERVER_URL}${API_PREFIX}${url}`;

export const constructEndpointWithVariable = {
    [Endpoints.ATTACH]: (sectionId: string | number): string =>
        addPrefixes(replaceId(Endpoints.ATTACH, String(sectionId))),
};
