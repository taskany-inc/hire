import { Problem, Section, Solution } from '@prisma/client';

import { GetSolutionsBySectionId } from '../backend/modules/solution/solution-types';
import { trpc } from '../utils/trpc-front';

import { useNotifications } from './useNotifications';

import { tr } from './hooks.i18n';

export const useSolutions = (params: GetSolutionsBySectionId, options?: { enabled: boolean }) => {
    const { enqueueErrorNotification } = useNotifications();

    return trpc.solutions.getBySectionId.useQuery(params, {
        ...options,
        onError: enqueueErrorNotification,
    });
};

export const useSolutionCreateMutation = () => {
    const { enqueueSuccessNotification, enqueueErrorNotification } = useNotifications();
    const utils = trpc.useContext();

    return trpc.solutions.create.useMutation({
        onSuccess: (data) => {
            enqueueSuccessNotification(`${tr('Added problem in section')} ${data.id}`);
            utils.solutions.invalidate();
        },
        onError: enqueueErrorNotification,
    });
};

export const useSolutionUpdateMutation = () => {
    const { enqueueSuccessNotification, enqueueErrorNotification } = useNotifications();
    const utils = trpc.useContext();

    return trpc.solutions.update.useMutation({
        onSuccess: (data) => {
            enqueueSuccessNotification(tr('Solution {id} updated', { id: data.id }));
            utils.solutions.invalidate();
        },
        onError: enqueueErrorNotification,
    });
};

type OnMutateContext =
    | {
          previousSolutions:
              | (Solution & {
                    problem: Problem;
                    section: Section;
                })[]
              | undefined;
      }
    | undefined;

export const useSwitchSolutionsOrder = () => {
    const { enqueueErrorNotification } = useNotifications();
    const utils = trpc.useContext();

    return trpc.solutions.switchOrder.useMutation({
        onMutate: async (data) => {
            const { sectionId } = data;
            await utils.solutions.getBySectionId.cancel({ sectionId });

            const previousSolutions = utils.solutions.getBySectionId.getData({
                sectionId,
            });

            const firstSolution = previousSolutions?.find(({ id }) => id === data.firstSolutionId);
            const secondSolution = previousSolutions?.find(({ id }) => id === data.secondSolutionId);

            previousSolutions &&
                secondSolution &&
                firstSolution &&
                utils.solutions.getBySectionId.setData(
                    { sectionId },
                    previousSolutions
                        .map((solution) => {
                            if (solution.id === data.firstSolutionId) {
                                return { ...solution, position: secondSolution.position };
                            }

                            if (solution.id === data.secondSolutionId) {
                                return { ...solution, position: firstSolution.position };
                            }

                            return solution;
                        })
                        .sort((a, b) => a.position - b.position),
                );

            return { previousSolutions };
        },
        onError: (err, data, context: OnMutateContext) => {
            const { sectionId } = data;
            context && utils.solutions.getBySectionId.setData({ sectionId }, context.previousSolutions);
            enqueueErrorNotification(err);
        },
        onSettled: () => {
            utils.solutions.invalidate();
        },
    });
};

export const useSolutionRemoveMutation = () => {
    const { enqueueSuccessNotification, enqueueErrorNotification } = useNotifications();
    const utils = trpc.useContext();

    return trpc.solutions.delete.useMutation({
        onSuccess: (data) => {
            enqueueSuccessNotification(tr('Solution {id} deleted', { id: data.id }));
            utils.solutions.invalidate();
        },
        onError: enqueueErrorNotification,
    });
};
