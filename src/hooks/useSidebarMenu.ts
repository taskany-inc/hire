import { useMemo } from 'react';

import { pageHrefs, Paths } from '../utils/paths';
import { useSession } from '../contexts/appSettingsContext';
import { accessChecks } from '../modules/accessChecks';
import config from '../config';

import { tr } from './hooks.i18n';

interface HeaderLink {
    path: string;
    text: string;
}

interface UseSidebarMenuResult {
    entityListMenuItems: HeaderLink[];
    entityCreationMenuItems: HeaderLink[];
}

export const useSidebarMenu = (): UseSidebarMenuResult => {
    const session = useSession();

    const entityListMenuItems = useMemo(() => {
        if (!session) {
            return [];
        }
        const items: HeaderLink[] = [{ path: Paths.PROBLEMS, text: tr('Problems') }];

        const canReadDashboard =
            session.userRoles.admin ||
            session.userRoles.hasHiringLeadRoles ||
            session.userRoles.hasRecruiterRoles ||
            session.userRoles.hasHireStreamManagerRoles;

        if (canReadDashboard) {
            items.push({ path: Paths.CANDIDATES_DASHBOARD, text: tr('Dashboard') });
        }

        const canReadCandidates = accessChecks.candidate.readMany(session).allowed;

        if (canReadCandidates) {
            items.push({ path: Paths.CANDIDATES, text: tr('Candidates') });
        }

        const canReadSections =
            session.userRoles.admin ||
            session.userRoles.hasHiringLeadRoles ||
            session.userRoles.hasRecruiterRoles ||
            session.userRoles.hasInterviewerRoles;

        if (canReadSections) {
            items.push({ path: Paths.MY_SECTIONS, text: tr('Sections') });
        }

        const canWorkWithCalendar = accessChecks.calendar.readMany(session).allowed;

        if (canWorkWithCalendar) {
            items.push({ path: Paths.CALENDAR_MY, text: tr('Calendar') });
        }

        const canReadAnalytics = accessChecks.analytics.read(session).allowed;

        if (canReadAnalytics) {
            items.push({ path: Paths.ANALYTICS, text: tr('Analytics') });
        }

        if (accessChecks.vacancy.read(session).allowed) {
            items.push({ path: Paths.VACANCIES, text: tr('Vacancies') });
        }

        config.pluginMenuItems.forEach((p) => items.push({ text: p.text, path: pageHrefs.plugins(p.path) }));

        if (session.userRoles.admin || session.userRoles.hasHireStreamManagerRoles) {
            items.push({ path: Paths.HIRE_STREAMS, text: tr('Hire streams') });
        }

        return items;
    }, [session]);

    const entityCreationMenuItems = useMemo(() => {
        const items: HeaderLink[] = [{ path: Paths.PROBLEMS_NEW, text: tr('New problem') }];

        const canCreateCandidates = session && accessChecks.candidate.create(session).allowed;

        if (canCreateCandidates) {
            items.push({ path: Paths.CANDIDATES_NEW, text: tr('New candidate') });
        }

        const canCreateHireStreams = session && accessChecks.hireStream.create(session).allowed;

        if (canCreateHireStreams) {
            items.push({ path: Paths.HIRE_STREAM_NEW, text: tr('New hire stream') });
        }

        return items;
    }, [session]);

    return { entityListMenuItems, entityCreationMenuItems };
};
