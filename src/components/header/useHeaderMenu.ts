import { useMemo } from 'react';

import { pageHrefs, Paths } from '../../utils/paths';
import { useSession } from '../../contexts/app-settings-context';
import { accessChecks } from '../../backend/access/access-checks';
import config from '../../backend/config';

type HeaderLink = { path: string; text: string };

type UseHeaderMenuResult = {
    entityListMenuItems: HeaderLink[];
    entityCreationMenuItems: HeaderLink[];
};

export const useHeaderMenu = (): UseHeaderMenuResult => {
    const session = useSession();

    const entityListMenuItems = useMemo(() => {
        if (!session) {
            return [];
        }
        const items: HeaderLink[] = [{ path: Paths.PROBLEMS, text: 'Problems' }];

        const canReadCandidates = accessChecks.candidate.readMany(session).allowed;

        if (canReadCandidates) {
            items.push({ path: Paths.CANDIDATES, text: 'Candidates' });
        }

        const canReadSections =
            session.userRoles.admin ||
            session.userRoles.hasHiringLeadRoles ||
            session.userRoles.hasRecruiterRoles ||
            session.userRoles.hasInterviewerRoles;

        if (canReadSections) {
            items.push({ path: Paths.MY_SECTIONS, text: 'Sections' });
        }

        const canWorkWithCalendar = accessChecks.calendar.create(session).allowed;

        if (canWorkWithCalendar) {
            items.push({ path: Paths.CALENDAR_MY, text: 'Calendar' });
        }

        const canReadAnalytics = accessChecks.analytics.read(session).allowed;

        if (canReadAnalytics) {
            items.push({ path: Paths.ANALYTICS, text: 'Analytics' });
        }

        config.pluginMenuItems.forEach((p) => items.push({ text: p.text, path: pageHrefs.plugins(p.path) }));

        return items;
    }, [session]);

    const entityCreationMenuItems = useMemo(() => {
        const items: HeaderLink[] = [{ path: Paths.PROBLEMS_NEW, text: 'New problem' }];

        const canCreateCandidates = session && accessChecks.candidate.create(session).allowed;

        if (canCreateCandidates) {
            items.push({ path: Paths.CANDIDATES_NEW, text: 'New candidate' });
        }

        const canCreateHireStreams = session && accessChecks.hireStream.create(session).allowed;

        if (canCreateHireStreams) {
            items.push({ path: Paths.HIRE_STREAM_NEW, text: 'New hire stream' });
        }

        const canCreateUsers = session && accessChecks.user.create(session);

        if (canCreateUsers) {
            items.push({ path: Paths.USERS_NEW, text: 'New user' });
        }

        return items;
    }, [session]);

    return { entityListMenuItems, entityCreationMenuItems };
};
