import { nullable } from '@taskany/bricks';
import { Text } from '@taskany/bricks/harmony';

import { pageHrefs } from '../../utils/paths';
import { Link } from '../Link';

import { tr } from './CandidateNameSubtitle.i18n';
import s from './CandidateNameSubtitle.module.css';

interface Props {
    id?: number;
    name: string;
}

// TODO: disable return value linting
export function CandidateNameSubtitle({ id, name }: Props) {
    return (
        <Text weight="semiBold" size="l" className={s.CandidateName}>
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
