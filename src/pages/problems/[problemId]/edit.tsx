import { accessChecks } from '../../../backend/access/access-checks';
import ProblemEditPage from '../../../controllers/ProblemEditPage';
import { createGetServerSideProps } from '../../../utils/create-get-ssr-props';

export const getServerSideProps = createGetServerSideProps({
    requireSession: true,
    numberIds: { problemId: true },
    action: async ({ ssg, session, numberIds, handleAccessChecks }) => {
        await ssg.tags.getAll.fetch();
        const problem = await ssg.problems.getById.fetch({ problemId: numberIds.problemId });
        await handleAccessChecks(() => accessChecks.problem.updateOrDelete(session, problem));
    },
});

export default ProblemEditPage;
