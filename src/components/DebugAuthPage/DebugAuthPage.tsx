import { User } from '@prisma/client';

import { DebugAuth } from '../DebugAuth/DebugAuth';
import { LayoutMain } from '../LayoutMain/LayoutMain';

import { tr } from './DebugAuthPage.i18n';

export interface DebugAuthPageProps {
    users: User[];
}
const DebugAuthPage = ({ users }: DebugAuthPageProps) => {
    return (
        <LayoutMain pageTitle={tr('Auth by debug cookie')}>
            <DebugAuth users={users} />
        </LayoutMain>
    );
};

export default DebugAuthPage;
