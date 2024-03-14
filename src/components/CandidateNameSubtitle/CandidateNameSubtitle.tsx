import { Text, nullable } from '@taskany/bricks';

import { pageHrefs } from '../../utils/paths';
import { Link } from '../Link';

import { tr } from './CandidateNameSubtitle.i18n';

interface Props {
    id?: number;
    name: string;
}

// TODO: disable return value linting
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function CandidateNameSubtitle({ id, name }: Props) {
    return (
        <Text
            size="xl"
            style={{
                fontWeight: 'bold',
                fontSize: '22px',
                lineHeight: '28px',
            }}
        >
            {tr('Candidate')}:{' '}
            {nullable(
                id,
                (id) => (
                    <Link href={pageHrefs.candidate(id)}>{name}</Link>
                ),
                name,
            )}
        </Text>
    );
}
