import { nullable, Text } from '@taskany/bricks';

import { tr } from './PlainTextChange.i18n';
import s from './PlainTextChange.module.css';

interface HistoryChangeProps {
    from?: string | null;
    to?: string | null;
}

export const PlainTextChange: React.FC<HistoryChangeProps> = ({ from, to }) => {
    const getTextContent = (text: string) => {
        if (text === 'true') {
            return tr('in archive');
        }
        if (text === 'false') {
            return tr('not in archive');
        }
        return text;
    };

    return (
        <div className={s.PlainTextChange}>
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
