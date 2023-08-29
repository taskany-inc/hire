import { router } from '../trpc-back';

import { analyticsQueriesRouter } from './analytics-queries-router';
import { calendarEventsRouter } from './calendar-events-router';
import { candidatesRouter } from './candidates-router';
import { externalUserRouter } from './external-users-router';
import { gradesRouter } from './grades-router';
import { hireStreamsRouter } from './hire-streams-router';
import { interviewsRouter } from './interviews-router';
import { problemsRouter } from './problems-router';
import { reactionsRouter } from './reactions-router';
import { sectionTypesRouter } from './section-types-router';
import { sectionsRouter } from './sections-router';
import { solutionsRouter } from './solutions-router';
import { tagsRouter } from './tags-router';
import { usersRouter } from './users-router';
import { rolesRouter } from './roles-router';
import { feedbackRouter } from './feedback-router';

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
