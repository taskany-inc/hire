import { LayoutMain } from '../components/layout/LayoutMain';
import { useProblem } from '../hooks/problem-hooks';

import { tr } from './controllers.i18n';
import { AddOrUpdateProblem } from '../components/problems/AddOrUpdateProblem';
import { Problem } from '@prisma/client';
import { QueryResolver } from '../components/QueryResolver';

export type ProblemEditPageProps = {
    problem: Problem,
    numberIds: Record<"problemId", number>,
};

const ProblemEditPage = ({numberIds}: ProblemEditPageProps) => {
    const problemQuery = useProblem(numberIds.problemId);

    return (
        <QueryResolver queries={[problemQuery]}>
            {([problem]) => (
                <LayoutMain pageTitle={`${problem.name} - ${tr('edit')}`}>
                    <AddOrUpdateProblem initialValues={problem} variant="update" />
                </LayoutMain>
            )}
        </QueryResolver>
    );
};

export default ProblemEditPage;
