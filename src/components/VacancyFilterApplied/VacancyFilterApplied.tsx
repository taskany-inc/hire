import { useMemo } from 'react';
import { FiltersApplied } from '@taskany/bricks';
import { gray7 } from '@taskany/colors';
import { HireStream, User } from '@prisma/client';

import { Group, VacancyStatus, vacancyLabels } from '../../modules/crewTypes';

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

interface EntityData {
    id: string | number;
    name: string;
}

function mapToAppliedString(map: Record<string, EntityData>, ids: string[] | number[], title: string): string {
    const arrayApplied = ids.reduce((acc, rec, index) => {
        const name = index === ids.length - 1 ? map[rec].name : `${map[rec].name}, `;
        return acc + name;
    }, '');
    return `${title}${arrayApplied}. `;
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
            const hireStreamMap = hireStreams.reduce(
                (acc, rec) => ({
                    ...acc,
                    [rec.id]: { id: String(rec.id), name: rec.name },
                }),
                {},
            );

            result += mapToAppliedString(hireStreamMap, hireStreamIds, tr('Streams: '));
        }

        if (hrs?.length && hrEmails?.length) {
            const hrMap = hrs.reduce(
                (acc, rec) => ({
                    ...acc,
                    [rec.email]: { name: rec.name || rec.email, id: rec.email },
                }),
                {},
            );

            result += mapToAppliedString(hrMap, hrEmails, tr("HR's: "));
        }

        if (hiringManagers?.length && hiringManagerEmails?.length) {
            const hiringManagerMap = hiringManagers.reduce(
                (acc, rec) => ({
                    ...acc,
                    [rec.email]: { name: rec.name || rec.email, id: rec.email },
                }),
                {},
            );

            result += mapToAppliedString(hiringManagerMap, hiringManagerEmails, tr('Hiring managers: '));
        }

        if (teams?.length && teamIds?.length) {
            const teamMap = teams.reduce((acc, rec) => ({ ...acc, [rec.id]: rec }), {});

            result += mapToAppliedString(teamMap, teamIds, tr('Teams: '));
        }

        return result;
    }, [hireStreams, hireStreamIds, statuses, teams, teamIds, hrs, hrEmails, hiringManagers, hiringManagerEmails]);

    return (
        <FiltersApplied size="s" weight="bold" color={gray7}>
            {applied}
        </FiltersApplied>
    );
};
