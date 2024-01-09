import { Attach } from '@prisma/client';

import { httpClient } from '../utils/httpClient';
import { pageHrefs } from '../utils/paths';

const remove = (id: string) => httpClient.delete<Attach>(pageHrefs.attach(id));

export const attachModule = { remove };
