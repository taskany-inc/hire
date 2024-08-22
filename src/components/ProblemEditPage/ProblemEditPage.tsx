import { Problem } from '@prisma/client';

import { useProblem } from '../../modules/problemHooks';
import { LayoutMain } from '../LayoutMain/LayoutMain';
import { AddOrUpdateProblem } from '../AddOrUpdateProblem/AddOrUpdateProblem';
import { QueryResolver } from '../QueryResolver/QueryResolver';

import { tr } from './ProblemEditPage.i18n';

export interface ProblemEditPageProps {
    problem: Problem;
    numberIds: Record<'problemId', number>;
}

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
