import { InterviewStatus } from '@prisma/client';
import React, { ReactNode, useCallback, useRef, useState } from 'react';
import {
    FiltersMenuContainer,
    FiltersCounter,
    FiltersCounterContainer,
    FiltersPanelContainer,
    FiltersPanelContent,
    FiltersSearchContainer,
    Input,
    FiltersMenuItem,
    Button,
    FilterPopup,
    nullable,
} from '@taskany/bricks';
import styled from 'styled-components';
import { gapS } from '@taskany/colors';

import { mapEnum } from '../../utils';
import { Filter } from '../Filter';
import { trpc } from '../../trpc/trpcClient';
import { suggestionsTake, useQueryOptions } from '../../utils/suggestions';
import { useSession } from '../../contexts/appSettingsContext';
import { useCandidateFilterContext } from '../../contexts/candidateFilterContext';
import { CandidateFilterApplied } from '../CandidateFilterApplied/CandidateFilterApplied';
import { useVacancies } from '../../modules/crewHooks';

import { tr } from './CandidateFilterBar.i18n';

type CandidateFilterBarProps = {
    loading?: boolean;
    children?: ReactNode;
};

const StyledResetButton = styled(Button)`
    margin-left: auto;
    margin-right: ${gapS};
`;

export const CandidateFilterBar = ({ loading, children }: CandidateFilterBarProps) => {
    const session = useSession();
    const filterNodeRef = useRef<HTMLSpanElement>(null);
    const [filterVisible, setFilterVisible] = useState(false);

    const {
        setSearch,
        statuses,
        setStatuses,
        hireStreamFilter,
        setHireStreamFilter,
        setHireStreamIds,
        clearFilters,
        hrIds,
        setHrIds,
        hrFilter,
        setHrFitlter,
        vacancyIds,
        setVacancyIds,
        total,
        count,
    } = useCandidateFilterContext();

    const [hrQuery, setHrQuery] = useState<string>('');

    const interviewStatuses = mapEnum(InterviewStatus, (key) => key);

    const [interviewStatusFilter, setInterviewStatusFilter] = useState<string[]>(statuses || []);

    const [hireStreamQuery, setHireStreamQuery] = useState('');

    const [vacancyQuery, setVacancyQuery] = useState<string>('');

    const isFiltersEmpty = !statuses && !hireStreamFilter.length && !hrIds.length;
    const onApplyClick = useCallback(() => {
        setFilterVisible(false);
        setHireStreamQuery('');
        setHrQuery('');
        setVacancyQuery('');

        setStatuses(interviewStatusFilter as InterviewStatus[]);
        setHireStreamIds(hireStreamFilter.map((hireStream) => Number(hireStream)));

        setHrIds(hrFilter.map((id) => Number(id)));
    }, [
        setFilterVisible,
        hrFilter,
        setHrIds,
        setHrQuery,
        setHireStreamQuery,
        setStatuses,
        interviewStatusFilter,
        setHireStreamIds,
        hireStreamFilter,
    ]);

    const { data: hireStreams = [] } = trpc.hireStreams.suggestions.useQuery(
        { query: hireStreamQuery, take: suggestionsTake, include: hireStreamFilter.map((id) => Number(id)) },
        useQueryOptions,
    );
    const { data: hrs = [] } = trpc.users.suggestions.useQuery(
        {
            query: hrQuery,
            hr: true,
            take: suggestionsTake - 1,
            include: session
                ? [session.user.id, ...hrFilter.map((id) => Number(id))]
                : hrFilter.map((id) => Number(id)),
        },
        useQueryOptions,
    );

    const vacanciesQuery = useVacancies({ archived: false, take: 5, search: vacancyQuery });
    const vacancies = vacanciesQuery.data?.pages[0].vacancies ?? [];

    const onResetFilers = () => {
        setHireStreamQuery('');
        setHrQuery('');
        setVacancyQuery('');
        setHireStreamFilter([]);
        setInterviewStatusFilter([]);
        setHrFitlter([]);
        clearFilters();
    };

    return (
        <>
            <FiltersPanelContainer loading={loading}>
                <FiltersPanelContent>
                    <FiltersSearchContainer>
                        <Input placeholder={tr('Search')} onChange={(e) => setSearch(e.target.value)} />
                    </FiltersSearchContainer>
                    <FiltersCounterContainer>
                        <FiltersCounter total={total} counter={count} />
                    </FiltersCounterContainer>
                    <FiltersMenuContainer>
                        <FiltersMenuItem
                            ref={filterNodeRef}
                            active={!isFiltersEmpty}
                            onClick={() => setFilterVisible((p) => !p)}
                        >
                            {tr('Filter')}
                        </FiltersMenuItem>
                        {children}
                    </FiltersMenuContainer>
                    <StyledResetButton text="Reset" onClick={onResetFilers} />
                </FiltersPanelContent>
            </FiltersPanelContainer>
            {nullable(!isFiltersEmpty, () => (
                <CandidateFilterApplied
                    hrs={hrs}
                    hrIds={hrIds}
                    interviewStatuses={interviewStatusFilter}
                    hireStreams={hireStreams}
                    hireStreamIds={hireStreamFilter}
                    vacancies={vacancies}
                    vacancyIds={vacancyIds}
                />
            ))}
            <FilterPopup
                applyButtonText={tr('Apply')}
                cancelButtonText={tr('Cancel')}
                visible={filterVisible}
                onApplyClick={onApplyClick}
                filterRef={filterNodeRef}
                switchVisible={setFilterVisible}
                activeTab="state"
            >
                <Filter
                    tabName="interviewStatus"
                    label={tr('Interview status')}
                    value={interviewStatusFilter}
                    items={interviewStatuses.map((status) => ({ id: status, name: status }))}
                    filterCheckboxName="interviewStatus"
                    onChange={setInterviewStatusFilter}
                    viewMode="union"
                />
                <Filter
                    title={tr('Suggestions')}
                    tabName="hireStream"
                    label={tr('Hire streams')}
                    placeholder={tr('Search')}
                    value={hireStreamFilter}
                    items={hireStreams.map((tag) => ({ id: String(tag.id), name: tag.name }))}
                    filterCheckboxName="hireStream"
                    onChange={setHireStreamFilter}
                    onSearchChange={setHireStreamQuery}
                    viewMode="split"
                />
                <Filter
                    title={tr('Suggestions')}
                    tabName="hrs"
                    label={tr("HR's")}
                    placeholder={tr('Search')}
                    value={hrFilter}
                    items={hrs.map((hr) => ({
                        id: String(hr.id),
                        name: `${hr.name || hr.email} ${hr.id === session?.user.id ? tr('(You)') : ''}`,
                        email: hr.email,
                    }))}
                    filterCheckboxName="hrs"
                    onChange={setHrFitlter}
                    onSearchChange={setHrQuery}
                    viewMode="split"
                />
                <Filter
                    title={tr('Suggestions')}
                    tabName="vacancies"
                    label={tr('Vacancies')}
                    placeholder={tr('Search')}
                    value={vacancyIds}
                    items={vacancies.map((vacancy) => ({
                        id: vacancy.id,
                        name: `${vacancy.name}, ${tr('grade')}: ${vacancy.grade}, ${tr('unit')}: ${vacancy.unit}`,
                    }))}
                    filterCheckboxName="vacancies"
                    onChange={setVacancyIds}
                    onSearchChange={setVacancyQuery}
                    viewMode="split"
                />
            </FilterPopup>
        </>
    );
};
