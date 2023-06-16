import { VFC } from 'react';

import { Problem } from '../../../controllers/Problem';
import { useProblem } from '../../../hooks/problem-hooks';
import { QueryResolver } from '../../../components/QueryResolver';
import { createGetServerSideProps } from '../../../utils/create-get-ssr-props';
import { InferServerSideProps } from '../../../types';

export const getServerSideProps = createGetServerSideProps({
    requireSession: true,
    numberIds: { problemId: true },
    action: async ({ ssg, numberIds }) => {
        await ssg.problems.getById.fetch({ problemId: numberIds.problemId });
    },
});

const ProblemPage: VFC<InferServerSideProps<typeof getServerSideProps>> = (props) => {
    const problemQuery = useProblem(props.numberIds.problemId);

    return <QueryResolver queries={[problemQuery]}>{([problem]) => <Problem problem={problem} />}</QueryResolver>;
};

export default ProblemPage;
