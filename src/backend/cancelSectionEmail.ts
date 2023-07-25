import { formatDateToLocaleString } from '../utils/date';

import { externalUsersService } from './modules/ext-users/ext-users-service';
import config from './config';

import { prisma } from '.';

import { tr } from './backend.i18n';

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

        return externalUsersService.sendEmail({
            from: 'Taskany Hire',
            to: section?.interviewer?.email,
            subject: tr('Cancel section'),
            text: `${tr('Canceled section with')} ${section.interview.candidate.name} ${date}
            ${config.defaultPageURL}/interviews/${section.interviewId}/sections/${section.id}`,
        });
    }
};
