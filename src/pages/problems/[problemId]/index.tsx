import { VFC } from 'react';

import { Problem } from '../../../components/Problem/Problem';
import { useProblem } from '../../../modules/problemHooks';
import { QueryResolver } from '../../../components/QueryResolver/QueryResolver';
import { createGetServerSideProps } from '../../../utils/createGetSSRProps';
import { InferServerSideProps } from '../../../utils/types';

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
