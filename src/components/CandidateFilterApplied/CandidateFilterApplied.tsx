import { FiltersApplied } from '@taskany/bricks';
import { useMemo } from 'react';
import { User } from 'prisma/prisma-client';
import { gray7 } from '@taskany/colors';
import styled from 'styled-components';

import { Vacancy } from '../../modules/crewTypes';

import { tr } from './CandidateFilterApplied.i18n';

type ProblemFilterAppliedProps = {
    hireStreams?: { id: number; name: string }[];
    hireStreamIds?: number[];
    interviewStatuses?: string[];
    hrs?: User[];
    hrIds?: number[];
    vacancies?: Vacancy[];
    vacancyIds?: string[];
};

const StyledApplied = styled(FiltersApplied)`
    position: absolute;
`;

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
            result = `${
                result +
                tr('Hire streams: ') +
                hireStreams
                    .filter((hireStream) => hireStreamIds?.includes(hireStream.id))
                    .map((t) => t.name)
                    .join(', ')
            }. `;
        }

        if (interviewStatuses?.length) {
            result = `${result + tr('Interview status: ') + interviewStatuses.join(', ')}. `;
        }

        if (hrs?.length && hrIds?.length) {
            result = `${
                result +
                tr("HR's: ") +
                hrs
                    .filter((hrs) => hrIds?.includes(hrs.id))
                    .map((a) => a.name || a.email)
                    .join(', ')
            }. `;
        }

        if (vacancies?.length && vacancyIds?.length) {
            result += `${tr('Vacancies')}: ${vacancies
                .filter((vacancy) => vacancyIds.includes(vacancy.id))
                .map((v) => v.name)
                .join(', ')}`;
        }

        return result;
    }, [hireStreams, hireStreamIds, interviewStatuses, hrs, hrIds, vacancies, vacancyIds]);

    return (
        <StyledApplied size="s" weight="bold" color={gray7}>
            {filterAppliedString}
        </StyledApplied>
    );
};
