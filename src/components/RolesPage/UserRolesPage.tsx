import { useSession } from '../../contexts/appSettingsContext';
import { accessChecks } from '../../modules/accessChecks';
import { AdminsList } from '../AdminList/AdminList';
import { LayoutMain } from '../LayoutMain/LayoutMain';
import { ProblemEditorsList } from '../ProblemEditorList/ProblemEditorList';
import { Stack } from '../Stack';

import { tr } from './RolesPage.i18n';

const UserRolesPage = () => {
    const session = useSession();

    if (!session) {
        return null;
    }

    const canReadAdmins = accessChecks.roles.readAdmins(session).allowed;
    return (
        <LayoutMain pageTitle={tr('Users roles')}>
            <Stack direction="column" justifyItems="flex-start" gap={24}>
                {canReadAdmins && <AdminsList />}
                <ProblemEditorsList />
            </Stack>
        </LayoutMain>
    );
};

export default UserRolesPage;
