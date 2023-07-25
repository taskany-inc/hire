import { UpdateSection } from './modules/section/section-types';
import { externalUsersService } from './modules/ext-users/ext-users-service';
import config from './config';

import { prisma } from '.';

import { tr } from './backend.i18n';

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
        return externalUsersService.sendEmail({
            from: 'Taskany Hire',
            to: section?.interview?.creator?.email,
            subject: tr(
                'Interviewer {interviewer} left feedback for the section with {candidate}',
                { interviewer: section.interviewer.name || '', candidate: section.interview.candidate.name },
            ),
            text: `${tr('Interviewer')} ${section.interviewer.name} ${tr('recommends')} ${
                data.hire ? `${tr('hire per')} ${section.grade} ${tr('level/grade')}` : tr('do not hire')
            } ${tr('candidate')} ${section.interview.candidate.name}\n
            ${data.feedback}\n
            ${config.defaultPageURL}/interviews/${section.interviewId}/sections/${section.id}`,
        });
    }
};
