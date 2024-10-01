import { FC } from 'react';
import { Badge, Spinner } from '@taskany/bricks/harmony';

import { tr } from './Loader.i18n';

export const Loader: FC = () => (
    <Badge iconLeft={<Spinner size="s" />} size="m" text={tr('Loading...')} weight="thin" />
);
