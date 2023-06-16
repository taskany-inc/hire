import NextLink from 'next/link';
import { TaskanyLogo } from '@taskany/bricks';

import { Paths } from '../../utils/paths';

export const PageHeaderLogo: React.FC = () => {
    // TODO: resolve custom logo from settings in db

    return (
        <NextLink href={Paths.HOME} passHref>
            <TaskanyLogo />
        </NextLink>
    );
};
