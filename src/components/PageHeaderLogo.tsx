import { TaskanyLogo } from '@taskany/bricks/harmony';

import { Paths } from '../utils/paths';

import { Link } from './Link';

export const PageHeaderLogo: React.FC<{ logo?: string }> = ({ logo }) => (
    <Link href={Paths.HOME}>
        <TaskanyLogo src={logo} />
    </Link>
);
