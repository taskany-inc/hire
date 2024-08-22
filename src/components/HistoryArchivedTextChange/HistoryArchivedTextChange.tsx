import { nullable } from '@taskany/bricks';
import { Text } from '@taskany/bricks/harmony';

import { tr } from './HistoryArchivedTextChange.i18n';
import s from './HistoryArchivedTextChange.module.css';

interface HistoryChangeProps {
    from?: string | null;
    to?: string | null;
}

export const HistoryArchivedTextChange: React.FC<HistoryChangeProps> = ({ from, to }) => {
    const getTextContent = (text: string) => {
        return text === 'true' ? tr('in archive') : tr('not in archive');
    };
    return (
        <div className={s.HistoryArchivedTextChange}>
            {nullable(from, (f) => (
                <div>
                    <Text as="span" size="xs" strike>
                        {tr('from')}: {getTextContent(f)}
                    </Text>
                </div>
            ))}
            {nullable(to, (t) => (
                <div>
                    <Text as="span" size="xs">
                        {tr('to')}: {getTextContent(t)}
                    </Text>
                </div>
            ))}
        </div>
    );
};
