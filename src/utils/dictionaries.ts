import { ProblemDifficulty, SolutionResult, InterviewStatus } from '@prisma/client';

/** Attention! This enum must be maintained in accordance with the established types of sections in the database */
export enum SectionType {
    SCREENING = 'SCREENING',
    CODING = 'CODING',
    FINAL = 'FINAL',
    PRODUCT_FINAL = 'PRODUCT_FINAL',
}

export enum ReactionEnum {
    GOOD = 'GOOD',
    OK = 'OK',
    BAD = 'BAD',
    UNKNOWN = 'UNKNOWN',
}

export const solutionResultText = {
    [SolutionResult.GOOD]: 'Good',
    [SolutionResult.OK]: 'Ok',
    [SolutionResult.BAD]: 'Bad',
    [SolutionResult.UNKNOWN]: 'Unknown',
};

export const solutionResultEmoji = {
    [SolutionResult.GOOD]: '👍',
    [SolutionResult.OK]: '👌',
    [SolutionResult.BAD]: '👎',
    [SolutionResult.UNKNOWN]: '🤷‍♂️',
};

export const reactionEmoji = {
    [ReactionEnum.GOOD]: '👍',
    [ReactionEnum.OK]: '👌',
    [ReactionEnum.BAD]: '👎',
    [ReactionEnum.UNKNOWN]: '🤷‍♂️',
};

export const problemDifficultyLabels = {
    [ProblemDifficulty.EASY]: 'Easy',
    [ProblemDifficulty.MEDIUM]: 'Medium',
    [ProblemDifficulty.HARD]: 'Hard',
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

export enum SectionGrade {
    HIRE = 'Hire',
    JUNIOR = 'Junior',
    MIDDLE = 'Middle',
    SENIOR = 'Senior',
}
