import { Problems } from '../../controllers/Problems';
import { LayoutMain } from '../../components/layout/LayoutMain';
import { ProblemFilterBar } from '../../components/problems/problem-filter/ProblemFilterBar';
import { createGetServerSideProps } from '../../utils/create-get-ssr-props';

import { tr } from './problems.i18n';

export const getServerSideProps = createGetServerSideProps({
    requireSession: true,
    action: async ({ ssg }) => {
        await ssg.problems.getList.fetch({});
    },
});

const ProblemsPage = () => {
    return (
        <LayoutMain pageTitle={tr('Problems')} aboveContainer={<ProblemFilterBar />}>
            <Problems />
        </LayoutMain>
    );
};

export default ProblemsPage;
