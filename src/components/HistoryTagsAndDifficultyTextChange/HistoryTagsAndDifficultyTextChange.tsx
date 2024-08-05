import { nullable, Text } from '@taskany/bricks';

import { tr } from './HistoryTagsAndDifficultyTextChange.i18n';
import s from './HistoryTagsAndDifficultyTextChange.module.css';

interface HistoryChangeProps {
    from?: string | null;
    to?: string | null;
}

export const HistoryTagsAndDifficultyTextChange: React.FC<HistoryChangeProps> = ({ from, to }) => (
    <div className={s.HistoryTagsAndDifficultyTextChange}>
        {nullable(from, () => (
            <div>
                <Text as="span" size="xs" strike>
                    {tr('from')}: {from}
                </Text>
            </div>
        ))}
        {nullable(to, () => (
            <div>
                <Text as="span" size="xs">
                    {tr('to')}: {to}
                </Text>
            </div>
        ))}
    </div>
);
