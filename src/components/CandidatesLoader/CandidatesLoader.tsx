import { FC } from 'react';
import { Text } from '@taskany/bricks';

import { tr } from './CandidatesLoader.i18n';

export const CandidatesLoader: FC = () => <Text>{tr('Loading candidates')} ⏳</Text>;
