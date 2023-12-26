import config from '../config';
import { prisma } from '../utils/prisma';
import { formatDateToLocaleString } from '../utils/date';

import { UpdateSection } from './sectionTypes';
import { tr } from './modules.i18n';
import { sendMail } from './nodemailer';

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
        return sendMail({
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

export const cancelSectionEmail = async (id: number) => {
    const section = await prisma.section.findFirst({
        where: { id },
        include: {
            interview: { include: { candidate: true } },
            calendarSlot: true,
            interviewer: true,
            sectionType: true,
        },
    });

    if (section?.interviewer?.email) {
        const date = section.calendarSlot?.date ? formatDateToLocaleString(section.calendarSlot?.date) : '';

        return sendMail({
            from: 'Taskany Hire',
            to: section?.interviewer?.email,
            subject: tr('Cancel section'),
            text: `${tr('Canceled section with')} ${section.interview.candidate.name} ${date}
            ${config.defaultPageURL}/interviews/${section.interviewId}/sections/${section.id}`,
        });
    }
};
