import { router } from '../trpcBackend';

import { analyticsQueriesRouter } from './analyticsQueriesRouter';
import { calendarEventsRouter } from './calendarEventsRouter';
import { candidatesRouter } from './candidatesRouter';
import { gradesRouter } from './gradesRouter';
import { hireStreamsRouter } from './hireStreamsRouter';
import { interviewsRouter } from './interviewsRouter';
import { problemsRouter } from './problemsRouter';
import { sectionTypesRouter } from './sectionTypesRouter';
import { sectionsRouter } from './sectionsRouter';
import { solutionsRouter } from './solutionsRouter';
import { tagsRouter } from './tagsRouter';
import { usersRouter } from './usersRouter';
import { rolesRouter } from './rolesRouter';
import { feedbackRouter } from './feedbackRouter';
import { commentRouter } from './commentRouter';
import { crewRouter } from './crewRouter';
import { appConfigRouter } from './appConfigRouter';
import { historyEventsRouter } from './historyEventsRouter';
import { reactionRouter } from './reactionRouter';
import { whatsnewRouter } from './whatsnewRouter';
import { rejectReasonRouter } from './rejectReasonRouter';

export const trpcRouter = router({
    analyticsQueries: analyticsQueriesRouter,
    calendarEvents: calendarEventsRouter,
    candidates: candidatesRouter,
    grades: gradesRouter,
    hireStreams: hireStreamsRouter,
    interviews: interviewsRouter,
    problems: problemsRouter,
    sectionTypes: sectionTypesRouter,
    sections: sectionsRouter,
    solutions: solutionsRouter,
    tags: tagsRouter,
    users: usersRouter,
    roles: rolesRouter,
    feedback: feedbackRouter,
    comments: commentRouter,
    crew: crewRouter,
    appConfig: appConfigRouter,
    historyEvents: historyEventsRouter,
    reaction: reactionRouter,
    whatsnew: whatsnewRouter,
    rejectReason: rejectReasonRouter,
});

export type TrpcRouter = typeof trpcRouter;
