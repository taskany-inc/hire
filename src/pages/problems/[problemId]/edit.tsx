import { accessChecks } from '../../../modules/accessChecks';
import ProblemEditPage from '../../../components/ProblemEditPage/ProblemEditPage';
import { createGetServerSideProps } from '../../../utils/createGetSSRProps';

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
