import { ProblemDifficulty, SolutionResult, InterviewStatus } from '@prisma/client';

import { tr } from './utils.i18n';

/** Attention! This enum must be maintained in accordance with the established types of sections in the database */
export enum SectionType {
    SCREENING = 'SCREENING',
    CODING = 'CODING',
    FINAL = 'FINAL',
    PRODUCT_FINAL = 'PRODUCT_FINAL',
}

export const solutionResultText = {
    [SolutionResult.GOOD]: tr('Good'),
    [SolutionResult.OK]: tr('Ok'),
    [SolutionResult.BAD]: tr('Bad'),
    [SolutionResult.UNKNOWN]: tr('Unknown'),
};

export const solutionResultEmoji = {
    [SolutionResult.GOOD]: '👍',
    [SolutionResult.OK]: '👌',
    [SolutionResult.BAD]: '👎',
    [SolutionResult.UNKNOWN]: '🤷‍♂️',
};

export const problemDifficultyLabels = {
    [ProblemDifficulty.EASY]: tr('Easy'),
    [ProblemDifficulty.MEDIUM]: tr('Medium'),
    [ProblemDifficulty.HARD]: tr('Hard'),
};

export const interviewStatusLabels = {
    [InterviewStatus.NEW]: 'New',
    [InterviewStatus.IN_PROGRESS]: 'In progress',
    [InterviewStatus.HIRED]: 'Hire',
    [InterviewStatus.REJECTED]: 'No hire',
};

export const candidateStatus = {
    [InterviewStatus.NEW]: 'New',
    [InterviewStatus.IN_PROGRESS]: 'In progress',
    [InterviewStatus.HIRED]: 'Hire',
    [InterviewStatus.REJECTED]: 'No hire',
};

export enum SectionStatus {
    HIRE = 'hire',
    NO_HIRE = 'no hire',
    NEW = 'new',
}

export enum InterviewStatusComment {
    HIRE = 'hire',
    NO_HIRE = 'no hire',
}
