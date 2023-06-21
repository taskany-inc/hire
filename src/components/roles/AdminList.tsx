import { useAdminsList } from '../../hooks/roles-hooks';
import { QueryResolver } from '../QueryResolver';
import { UserList } from '../users/UserList';

import { tr } from './roles.i18n';

export const AdminsList = () => {
    const adminsListQuery = useAdminsList();

    return (
        <QueryResolver queries={[adminsListQuery]}>
            {([admins]) => <UserList title={tr('Administrators')} users={admins} />}
        </QueryResolver>
    );
};
