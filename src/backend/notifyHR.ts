import { UpdateSection } from './modules/section/section-types';
import { externalUsersService } from './modules/ext-users/ext-users-service';
import config from './config';

import { prisma } from '.';

export const notifyHR = async (id: number, data: UpdateSection) => {
    if (!data.feedback) {
        return;
    }

    const section = await prisma.section.findFirst({
        where: { id },
        include: {
            interview: { include: { creator: true, candidate: true } },
            interviewer: true,
            sectionType: true,
        },
    });
    if (section?.interview?.creator?.email) {
        // TODO: add localization after https://github.com/taskany-inc/hire/issues/191
        return externalUsersService.sendEmail({
            from: 'Taskany Hire',
            to: section?.interview?.creator?.email,
            subject: `Interviewer ${section.interviewer.name || ''} left feedback for the section with ${
                section.interview.candidate.name
            }`,
            text: `Interviewer ${section.interviewer.name} recommends' ${
                data.hire ? `hire per ${data.grade} level/grade` : 'do not hire'
            } candidate ${section.interview.candidate.name}\n
            ${data.feedback}\n
            ${config.defaultPageURL}/interviews/${section.interviewId}/sections/${section.id}`,
        });
    }
};
