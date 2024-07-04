import { LayoutMain } from '../LayoutMain/LayoutMain';
import { NewUserForm } from '../NewUserForm/NewUserForm';

import { tr } from './NewUserPage.i18n';

const NewUserPage = () => {
    return (
        <LayoutMain pageTitle={tr('New user')}>
            <NewUserForm />
        </LayoutMain>
    );
};

export default NewUserPage;
