import { Text } from '@taskany/bricks/harmony';
import { nullable } from '@taskany/bricks';

import { tr } from './PlainTextChange.i18n';
import s from './PlainTextChange.module.css';

interface HistoryChangeProps {
    from?: string | null;
    to?: string | null;
}

export const PlainTextChange: React.FC<HistoryChangeProps> = ({ from, to }) => (
    <div className={s.PlainTextChange}>
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
