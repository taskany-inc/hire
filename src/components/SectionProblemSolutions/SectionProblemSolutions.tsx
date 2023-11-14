import { VFC } from 'react';
import { Text } from '@taskany/bricks';

import { SolutionWithRelations } from '../../modules/solutionTypes';
import { useSwitchSolutionsOrder } from '../../modules/solutionHooks';
import { SolutionCard } from '../SolutionCard/SolutionCard';
import { Stack } from '../Stack';

import { tr } from './SectionProblemSolutions.i18n';

interface SectionProblemSolutionsProps {
    sectionId: number;
    solutions: SolutionWithRelations[];
    interviewId: number;
    isEditable: boolean;
}

export const SectionProblemSolutions: VFC<SectionProblemSolutionsProps> = ({
    sectionId,
    solutions,
    interviewId,
    isEditable,
}) => {
    const switchSolutionsOrderMutation = useSwitchSolutionsOrder();

    if (solutions.length < 1) {
        return <Text>There are no problems in the section</Text>;
    }

    return (
        <Stack direction="column" gap={16}>
            <Text size="l">{tr('Problems and solutions of the candidate')}</Text>

            {solutions.map((solution, index) => {
                const goUp =
                    index === 0
                        ? undefined
                        : async () => {
                              await switchSolutionsOrderMutation.mutateAsync({
                                  sectionId,
                                  firstSolutionId: solution.id,
                                  secondSolutionId: solutions[index - 1].id,
                              });
                          };

                const goDown =
                    index === solutions.length - 1
                        ? undefined
                        : async () => {
                              await switchSolutionsOrderMutation.mutateAsync({
                                  sectionId,
                                  firstSolutionId: solution.id,
                                  secondSolutionId: solutions[index + 1].id,
                              });
                          };

                return (
                    <SolutionCard
                        isSwitchOrderDisabled={switchSolutionsOrderMutation.isLoading}
                        goUp={goUp}
                        goDown={goDown}
                        solution={solution}
                        interviewId={interviewId}
                        isEditable={isEditable}
                        key={solution.id}
                    />
                );
            })}
        </Stack>
    );
};
