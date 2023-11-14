import { Text } from '@taskany/bricks';

import { pageHrefs } from '../utils/paths';

import { Link } from './Link';

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
            Candidate: {typeof id !== 'number' ? name : <Link href={pageHrefs.candidate(id)}>{name}</Link>}
        </Text>
    );
}
