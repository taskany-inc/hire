export enum Paths {
    HOME = '/',

    AUTH_SIGNIN = '/api/auth/signin',

    PROBLEMS = '/problems',
    PROBLEMS_NEW = '/problems/new',
    PROBLEM = '/problems/{problemId}',
    PROBLEM_EDIT = '/problems/{problemId}/edit',

    MY_SECTIONS = '/sections/my',

    INTERVIEWS = '/interviews',
    INTERVIEW = '/interviews/{interviewId}',
    INTERVIEW_HISTORY = '/interviews/{interviewId}/history',
    INTERVIEW_ACCESS = '/interviews/{interviewId}/access',

    SECTIONS_NEW = '/interviews/{interviewId}/sections/new',
    SECTION = '/interviews/{interviewId}/sections/{sectionId}',
    SECTION_EDIT = '/interviews/{interviewId}/sections/{sectionId}/edit',
    SECTION_HISTORY = '/interviews/{interviewId}/sections/{sectionId}/history',

    SECTION_TYPES_NEW = '/section-types/new',
    SECTION_TYPES = '/section-types',
    SECTION_TYPE = '/section-types/{sectionTypeId}',
    SECTION_TYPE_EDIT = '/section-types/{sectionTypeId}/edit',

    CANDIDATES = '/candidates',
    CANDIDATES_DASHBOARD = '/candidates-dashboard',
    CANDIDATES_NEW = '/candidates/new',
    CANDIDATE = '/candidates/{candidateId}',
    CANDIDATE_INTERVIEW_CREATE = '/candidates/{candidateId}/interviews/new',
    CANDIDATE_EDIT = '/candidates/{candidateId}/edit',

    USERS_NEW = '/users/new',
    USERS_SETTINGS = '/users/settings',

    HIRE_STREAMS = '/hire-streams',
    HIRE_STREAM = '/hire-streams/{hireStreamName}',
    HIRE_STREAM_ROLES = '/hire-streams/{hireStreamName}/roles',

    PLUGINS = '/plugins',

    CALENDAR_MY = '/calendar/my',

    DEBUG_AUTH = '/debug/auth',

    ANALYTICS = '/analytics',
    ANALYTICS_COMMON = '/analytics/common',
    ANALYTICS_HIRE_STREAM = '/analytics/hire-stream/{hireStreamName}',

    VACANCIES = '/vacancies',

    ROLES = '/roles',

    ATTACH = '/api/attach',
}

/* eslint-disable @typescript-eslint/no-unused-vars */
type ExtractPathVars<T extends string> = T extends `/{${infer Id}}/${infer Rest}`
    ? Id | ExtractPathVars<`/${Rest}`>
    : T extends `/{${infer Id}}`
    ? Id
    : T extends `/${infer _Start}/${infer Rest}`
    ? ExtractPathVars<`/${Rest}`>
    : never;

type DetectVarType<T extends string> = T extends `${infer _Start}Id` ? number : string;
/* eslint-enable @typescript-eslint/no-unused-vars */

type PathVars<Path extends string, Vars extends string = ExtractPathVars<Path>> = {
    [V in Vars]: DetectVarType<V>;
};

export const generatePath = <T extends Paths>(path: T, vars: PathVars<T>): string =>
    Object.entries(vars).reduce((prev, curr) => prev.replace(`{${curr[0]}}`, String(curr[1])), String(path));

export const pageHrefs = {
    problem: (problemId: number): string => generatePath(Paths.PROBLEM, { problemId }),
    problemEdit: (problemId: number): string => generatePath(Paths.PROBLEM_EDIT, { problemId }),

    candidate: (candidateId: number): string => generatePath(Paths.CANDIDATE, { candidateId }),
    candidateInterviewCreate: (candidateId: number): string =>
        generatePath(Paths.CANDIDATE_INTERVIEW_CREATE, { candidateId }),

    interview: (interviewId: number): string => generatePath(Paths.INTERVIEW, { interviewId }),
    interviewHistory: (interviewId: number): string => generatePath(Paths.INTERVIEW_HISTORY, { interviewId }),
    interviewAccess: (interviewId: number): string => generatePath(Paths.INTERVIEW_ACCESS, { interviewId }),

    interviewSectionCreate: (interviewId: number, sectionTypeId: number, _schedulable: boolean): string =>
        `${generatePath(Paths.SECTIONS_NEW, { interviewId })}/${sectionTypeId}`,
    interviewSectionView: (interviewId: number, sectionId: number): string =>
        generatePath(Paths.SECTION, { interviewId, sectionId }),
    interviewSectionEdit: (interviewId: number, sectionId: number): string =>
        generatePath(Paths.SECTION_EDIT, { interviewId, sectionId }),

    sectionType: (sectionTypeId: number): string => generatePath(Paths.SECTION_TYPE, { sectionTypeId }),
    sectionTypeEdit: (sectionTypeId: number): string => generatePath(Paths.SECTION_TYPE_EDIT, { sectionTypeId }),

    hireStream: (hireStreamName: string): string => generatePath(Paths.HIRE_STREAM, { hireStreamName }),
    hireStreamRoles: (hireStreamName: string): string => generatePath(Paths.HIRE_STREAM_ROLES, { hireStreamName }),

    plugins: (pluginName: string): string => `${Paths.PLUGINS}?name=${encodeURIComponent(pluginName)}`,

    analyticsHireStream: (hireStreamName: string): string =>
        generatePath(Paths.ANALYTICS_HIRE_STREAM, { hireStreamName }),

    attach: (id: string): string => `${Paths.ATTACH}?id=${id}`,
    attachAndParseCv: (candidateId?: number): string =>
        `${Paths.ATTACH}?parseCv=1${candidateId ? `&candidateId=${candidateId}` : ''}`,
    attachInterview: (interviewId: number): string => `${Paths.ATTACH}?interviewId=${interviewId}`,
    attachSection: (sectionId: number): string => `${Paths.ATTACH}?sectionId=${sectionId}`,
    attachComment: (commentId: string): string => `${Paths.ATTACH}?commentId=${commentId}`,
};
