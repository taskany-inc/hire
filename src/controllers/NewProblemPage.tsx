import { LayoutMain } from '../components/layout/LayoutMain';
import { AddOrUpdateProblem } from '../components/problems/AddOrUpdateProblem';

import { tr } from './controllers.i18n';

const NewProblemPage = () => {
    return (
        <LayoutMain pageTitle={tr('New problem')}>
            <AddOrUpdateProblem variant="new" />
        </LayoutMain>
    );
};

export default NewProblemPage;
