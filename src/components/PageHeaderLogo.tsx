import { TaskanyLogo } from '@taskany/bricks/harmony';

import { Paths } from '../utils/paths';

import { Link } from './Link';
import s from './PageHeader/PageHeader.module.css';
import { TitleLogo } from './TitleLogo';

export const PageHeaderLogo: React.FC<{ logo?: string }> = ({ logo }) => (
    <Link href={Paths.HOME} className={s.Link}>
        <TaskanyLogo src={logo} />
        <TitleLogo className={s.TitleLogo} />
    </Link>
);
