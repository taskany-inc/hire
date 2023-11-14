import { Attach } from '@prisma/client';

import { constructEndpointWithVariable, Endpoints } from '../utils/endpoints';
import { httpClient } from '../utils/httpClient';

const uploadFile = (sectionId: number, data: FormData) =>
    httpClient.postFiles<Attach>(constructEndpointWithVariable[Endpoints.ATTACH](sectionId), data);

const remove = (filepath: string) =>
    httpClient.delete<Attach>(constructEndpointWithVariable[Endpoints.ATTACH](filepath));

export const attachModule = { remove, uploadFile };
