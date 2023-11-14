import { LayoutMain } from '../LayoutMain';
import { AddOrUpdateProblem } from '../AddOrUpdateProblem/AddOrUpdateProblem';

import { tr } from './NewProblemPage.i18n';

const NewProblemPage = () => {
    return (
        <LayoutMain pageTitle={tr('New problem')}>
            <AddOrUpdateProblem variant="new" />
        </LayoutMain>
    );
};

export default NewProblemPage;
