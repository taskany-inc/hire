import { Problem } from '@prisma/client';

import { LayoutMain } from '../components/layout/LayoutMain';
import { useProblem } from '../hooks/problem-hooks';
import { AddOrUpdateProblem } from '../components/problems/AddOrUpdateProblem';
import { QueryResolver } from '../components/QueryResolver';

import { tr } from './controllers.i18n';

export type ProblemEditPageProps = {
    problem: Problem;
    numberIds: Record<'problemId', number>;
};

const ProblemEditPage = ({ numberIds }: ProblemEditPageProps) => {
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
