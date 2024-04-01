import { useMemo } from 'react';
import { FiltersApplied } from '@taskany/bricks';
import { gray7 } from '@taskany/colors';
import { HireStream, User } from '@prisma/client';

import { Group, VacancyStatus, vacancyLabels } from '../../modules/crewTypes';
import { arrayToAppliedString } from '../../utils';

import { tr } from './VacancyFilterApplied.i18n';

interface VacancyFilterAppliedProps {
    hireStreams?: HireStream[];
    hireStreamIds?: number[];
    statuses?: string[];
    teams?: Group[];
    teamIds?: string[];
    hrs?: User[];
    hrEmails?: string[];
    hiringManagers?: User[];
    hiringManagerEmails?: string[];
}

export const VacancyFilterApplied = ({
    hireStreams,
    hireStreamIds,
    statuses,
    teams,
    teamIds,
    hrs,
    hrEmails,
    hiringManagers,
    hiringManagerEmails,
}: VacancyFilterAppliedProps) => {
    const applied = useMemo(() => {
        let result = '';

        if (statuses?.length) {
            result += `${tr('Status: ')}${statuses.map((s) => vacancyLabels[s as VacancyStatus]).join(', ')}. `;
        }

        if (hireStreams?.length && hireStreamIds?.length) {
            result += arrayToAppliedString(hireStreams, hireStreamIds, tr('Streams: '), 'id');
        }

        if (hrs?.length && hrEmails?.length) {
            result += arrayToAppliedString(hrs, hrEmails, tr("HR's: "), 'email');
        }

        if (hiringManagers?.length && hiringManagerEmails?.length) {
            result += arrayToAppliedString(hiringManagers, hiringManagerEmails, tr('Hiring managers: '), 'email');
        }

        if (teams?.length && teamIds?.length) {
            result += arrayToAppliedString(teams, teamIds, tr('Teams: '), 'id');
        }

        return result;
    }, [hireStreams, hireStreamIds, statuses, teams, teamIds, hrs, hrEmails, hiringManagers, hiringManagerEmails]);

    return (
        <FiltersApplied size="s" weight="bold" color={gray7}>
            {applied}
        </FiltersApplied>
    );
};
