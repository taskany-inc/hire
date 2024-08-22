import { PlainTextChange } from '../PlainTextChange/PlainTextChange';

import { tr } from './ArchivedChange.i18n';

interface ArchivedChangeProps {
    from?: string | null;
    to?: string | null;
}
export const ArchivedChange: React.FC<ArchivedChangeProps> = ({ from, to }) => {
    const getTextContent = (text?: string | null) => {
        if (text === 'true') {
            return tr('in archive');
        }
        if (text === 'false') {
            return tr('not in archive');
        }
        return text;
    };
    return <PlainTextChange from={getTextContent(from)} to={getTextContent(to)} />;
};
