import { router } from '../trpcBackend';

import { analyticsQueriesRouter } from './analyticsQueriesRouter';
import { calendarEventsRouter } from './calendarEventsRouter';
import { candidatesRouter } from './candidatesRouter';
import { externalUserRouter } from './externalUsersRouter';
import { gradesRouter } from './gradesRouter';
import { hireStreamsRouter } from './hireStreamsRouter';
import { interviewsRouter } from './interviewsRouter';
import { problemsRouter } from './problemsRouter';
import { reactionsRouter } from './reactionsRouter';
import { sectionTypesRouter } from './sectionTypesRouter';
import { sectionsRouter } from './sectionsRouter';
import { solutionsRouter } from './solutionsRouter';
import { tagsRouter } from './tagsRouter';
import { usersRouter } from './usersRouter';
import { rolesRouter } from './rolesRouter';
import { feedbackRouter } from './feedbackRouter';

export const trpcRouter = router({
    analyticsQueries: analyticsQueriesRouter,
    calendarEvents: calendarEventsRouter,
    candidates: candidatesRouter,
    externalUsers: externalUserRouter,
    grades: gradesRouter,
    hireStreams: hireStreamsRouter,
    interviews: interviewsRouter,
    problems: problemsRouter,
    reactions: reactionsRouter,
    sectionTypes: sectionTypesRouter,
    sections: sectionsRouter,
    solutions: solutionsRouter,
    tags: tagsRouter,
    users: usersRouter,
    roles: rolesRouter,
    feedback: feedbackRouter,
});

export type TrpcRouter = typeof trpcRouter;