import { FiltersApplied } from '@taskany/bricks';
import { useMemo } from 'react';
import { User } from 'prisma/prisma-client';
import { gray7 } from '@taskany/colors';

import { Vacancy } from '../../modules/crewTypes';
import { arrayToAppliedString } from '../../utils';

import { tr } from './CandidateFilterApplied.i18n';

interface ProblemFilterAppliedProps {
    hireStreams?: { id: number; name: string }[];
    hireStreamIds?: number[];
    interviewStatuses?: string[];
    hrs?: User[];
    hrIds?: number[];
    vacancies?: Vacancy[];
    vacancyIds?: string[];
}

export const CandidateFilterApplied = ({
    hireStreams,
    hireStreamIds,
    interviewStatuses,
    hrs,
    hrIds,
    vacancies,
    vacancyIds,
}: ProblemFilterAppliedProps) => {
    const filterAppliedString = useMemo(() => {
        let result = '';

        if (hireStreams?.length && hireStreamIds?.length) {
            result += arrayToAppliedString(hireStreams, hireStreamIds, tr('Hire streams: '), 'id');
        }

        if (interviewStatuses?.length) {
            result = `${result + tr('Interview status: ') + interviewStatuses.join(', ')}. `;
        }

        if (hrs?.length && hrIds?.length) {
            result += arrayToAppliedString(hrs, hrIds, tr("HR's: "), 'id');
        }

        if (vacancies?.length && vacancyIds?.length) {
            result += arrayToAppliedString(vacancies, vacancyIds, tr('Vacancies: '), 'id');
        }

        return result;
    }, [hireStreams, hireStreamIds, interviewStatuses, hrs, hrIds, vacancies, vacancyIds]);

    return (
        <FiltersApplied size="s" weight="bold" color={gray7}>
            {filterAppliedString}
        </FiltersApplied>
    );
};
