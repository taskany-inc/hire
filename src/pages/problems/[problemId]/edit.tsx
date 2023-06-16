import { VFC } from 'react';

import { LayoutMain } from '../../../components/layout/LayoutMain';
import { AddOrUpdateProblem } from '../../../components/problems/AddOrUpdateProblem';
import { InferServerSideProps } from '../../../types';
import { accessChecks } from '../../../backend/access/access-checks';
import { createGetServerSideProps } from '../../../utils/create-get-ssr-props';
import { useProblem } from '../../../hooks/problem-hooks';
import { QueryResolver } from '../../../components/QueryResolver';

export const getServerSideProps = createGetServerSideProps({
    requireSession: true,
    numberIds: { problemId: true },
    action: async ({ ssg, session, numberIds, handleAccessChecks }) => {
        await ssg.tags.getAll.fetch();
        const problem = await ssg.problems.getById.fetch({ problemId: numberIds.problemId });
        await handleAccessChecks(() => accessChecks.problem.updateOrDelete(session, problem));
    },
});

const ProblemEditPage: VFC<InferServerSideProps<typeof getServerSideProps>> = (props) => {
    const problemQuery = useProblem(props.numberIds.problemId);

    return (
        <QueryResolver queries={[problemQuery]}>
            {([problem]) => (
                <LayoutMain pageTitle={`${problem.name} - edit`}>
                    <AddOrUpdateProblem initialValues={problem} variant="update" />
                </LayoutMain>
            )}
        </QueryResolver>
    );
};

export default ProblemEditPage;
