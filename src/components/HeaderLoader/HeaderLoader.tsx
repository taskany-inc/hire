import { FC } from 'react';
import { Badge, Spinner } from '@taskany/bricks/harmony';

import { tr } from './HeaderLoader.i18n';

export const HeaderLoader: FC = () => (
    <Badge iconLeft={<Spinner size="s" />} size="m" text={tr('Loading...')} weight="thin" />
);
