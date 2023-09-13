import { TaskanyLogo } from '@taskany/bricks';

import { Paths } from '../../utils/paths';
import { Link } from '../Link';

export const PageHeaderLogo: React.FC = () => {
    // TODO: resolve custom logo from settings in db

    return (
        <Link href={Paths.HOME}>
            <TaskanyLogo />
        </Link>
    );
};
