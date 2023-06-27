import { User } from '@prisma/client';
import { DebugAuth } from '../components/DebugAuth';
import { LayoutMain } from '../components/layout/LayoutMain';

import { tr } from './controllers.i18n';

export type DebugAuthPageProps = {
    users: User[];
};
const DebugAuthPage = ({ users }: DebugAuthPageProps) => {
    return (
        <LayoutMain pageTitle={tr('Auth by debug cookie')}>
            <DebugAuth users={users} />
        </LayoutMain>
    );
};

export default DebugAuthPage;
