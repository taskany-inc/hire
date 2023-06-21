import { AddOrUpdateProblem } from '../../components/problems/AddOrUpdateProblem';
import { LayoutMain } from '../../components/layout/LayoutMain';
import { createGetServerSideProps } from '../../utils/create-get-ssr-props';

import { tr } from './problems.i18n';

export const getServerSideProps = createGetServerSideProps({
    requireSession: true,
    action: async ({ ssg }) => {
        await ssg.tags.getAll.fetch();
    },
});

const NewProblemPage = () => {
    return (
        <LayoutMain pageTitle={tr('New problem')}>
            <AddOrUpdateProblem variant="new" />
        </LayoutMain>
    );
};

export default NewProblemPage;
