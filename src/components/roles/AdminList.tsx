import { useAdminsList } from '../../hooks/roles-hooks';
import { QueryResolver } from '../QueryResolver';
import { UserList } from '../users/UserList';

export const AdminsList = () => {
    const adminsListQuery = useAdminsList();

    return (
        <QueryResolver queries={[adminsListQuery]}>
            {([admins]) => <UserList title="Administrators" users={admins} />}
        </QueryResolver>
    );
};
