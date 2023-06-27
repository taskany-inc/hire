import { LayoutMain } from "../components/layout/LayoutMain";
import { NewUserForm } from "../components/users/NewUserForm";

import { tr } from './controllers.i18n';

const NewUserPage = () => {
    return (
        <LayoutMain pageTitle={tr('New user')}>
            <NewUserForm />
        </LayoutMain>
    );
};

export default NewUserPage;