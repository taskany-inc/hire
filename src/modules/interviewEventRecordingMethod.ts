import { interviewMethods } from './interviewMethods';
import { InterviewWithSections } from './interviewTypes';
import { InterviewEventTypes } from './interviewEventTypes';
import { interviewEvenMethods } from './interviewEventMethods';

type RecordingUpdateEvent = {
    userId: number;
    eventType: InterviewEventTypes;
    previousInterview: InterviewWithSections;
};

async function recordingUpdateEvent({ previousInterview, userId, eventType }: RecordingUpdateEvent): Promise<void> {
    const { id: interviewId } = previousInterview;
    const updatedInterviewData = await interviewMethods.findWithSections(interviewId);

    const data = {
        userId,
        interviewId,
        type: eventType,
        before: JSON.stringify(previousInterview),
        after: JSON.stringify(updatedInterviewData),
    };

    await interviewEvenMethods.create(data);
}

type RecordingCreateSection = {
    userId: number;
    previousInterview: InterviewWithSections;
};

async function recordingCreateSectionEvent({ userId, previousInterview }: RecordingCreateSection): Promise<void> {
    const { id: interviewId } = previousInterview;
    const updatedInterviewData = await interviewMethods.getById(interviewId);
    const data = {
        userId,
        interviewId,
        type: InterviewEventTypes.SECTION_CREATE,
        before: JSON.stringify(previousInterview),
        after: JSON.stringify(updatedInterviewData),
    };

    await interviewEvenMethods.create(data);
}

type RecordingCreateInterviewEvent = {
    userId: number;
    interview: InterviewWithSections;
};

async function recordingCreateInterviewEvent({ userId, interview }: RecordingCreateInterviewEvent): Promise<void> {
    const data = {
        userId,
        interviewId: interview.id,
        type: InterviewEventTypes.INTERVIEW_CREATE,
        before: undefined,
        after: JSON.stringify(interview),
    };
    await interviewEvenMethods.create(data);
}

type RecordingDeleteInterviewEvent = {
    userId: number;
    interview: InterviewWithSections;
};

async function recordingDeleteInterviewEvent({ userId, interview }: RecordingDeleteInterviewEvent): Promise<void> {
    const data = {
        userId,
        interviewId: undefined,
        type: InterviewEventTypes.INTERVIEW_DELETE,
        before: JSON.stringify(interview),
        after: undefined,
    };
    await interviewEvenMethods.create(data);
}

export const interviewEventRecordingMethod = {
    recordingUpdateEvent,
    recordingCreateInterviewEvent,
    recordingCreateSectionEvent,
    recordingDeleteInterviewEvent,
};
