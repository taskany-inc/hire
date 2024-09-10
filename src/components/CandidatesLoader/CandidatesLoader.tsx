import { FC } from 'react';
import { Text } from '@taskany/bricks/harmony';

import { tr } from './CandidatesLoader.i18n';

export const CandidatesLoader: FC = () => <Text>{tr('Loading candidates')} ⏳</Text>;
