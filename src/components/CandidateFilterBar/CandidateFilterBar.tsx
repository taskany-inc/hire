import { InterviewStatus } from '@prisma/client';
import React, { ReactNode, useRef, useState } from 'react';
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
import { CandidateFilterApplied } from '../CandidateFilterApplied/CandidateFilterApplied';
import { useVacancies } from '../../modules/crewHooks';
import { Vacancy } from '../../modules/crewTypes';
import {
    useCandidateFilterUrlParams,
    candidateFilterValuesToRequestData,
} from '../../hooks/useCandidateFilterUrlParams';
import { useCandidates } from '../../modules/candidateHooks';

import { tr } from './CandidateFilterBar.i18n';

type CandidateFilterBarProps = {
    loading?: boolean;
    children?: ReactNode;
};

const StyledResetButton = styled(Button)`
    margin-left: auto;
    margin-right: ${gapS};
`;

const vacancyToString = (vacancy: Vacancy) => {
    let result = vacancy.name;
    if (vacancy.grade !== null) {
        result += `, ${tr('grade')}: ${vacancy.grade}`;
    }
    if (vacancy.unit) {
        result += `, ${tr('unit')}: ${vacancy.unit}`;
    }
    return result;
};

export const CandidateFilterBar = ({ loading, children }: CandidateFilterBarProps) => {
    const session = useSession();
    const filterNodeRef = useRef<HTMLSpanElement>(null);
    const [filterVisible, setFilterVisible] = useState(false);

    const { values, setter, clearParams, setSearch } = useCandidateFilterUrlParams();

    const [hrQuery, setHrQuery] = useState<string>('');

    const interviewStatuses = mapEnum(InterviewStatus, (key) => key);

    const [interviewStatusLocal, setInterviewStatusLocal] = useState<string[] | undefined>(values.statuses);

    const [hrIdsLocal, setHrIdsLocal] = useState(values.hrIds);

    const [hireStreamIdsLocal, setHireStreamIdsLocal] = useState(values.hireStreamIds);

    const [vacancyIdsLocal, setVacancyIdsLocal] = useState(values.vacancyIds);

    const [hireStreamQuery, setHireStreamQuery] = useState('');

    const [vacancyQuery, setVacancyQuery] = useState<string>('');

    const isFiltersEmpty =
        !values.statuses && !values.hireStreamIds?.length && !values.hrIds?.length && !values.vacancyIds?.length;

    const onApplyClick = () => {
        setFilterVisible(false);
        setHireStreamQuery('');
        setHrQuery('');
        setVacancyQuery('');
        setter('statuses', interviewStatusLocal);
        setter('hireStreamIds', hireStreamIdsLocal);
        setter('hrIds', hrIdsLocal);
        setter('vacancyIds', vacancyIdsLocal);
    };

    const { data: hireStreams = [] } = trpc.hireStreams.suggestions.useQuery(
        { query: hireStreamQuery, take: suggestionsTake, include: values.hireStreamIds },
        useQueryOptions,
    );
    const { data: hrs = [] } = trpc.users.suggestions.useQuery(
        {
            query: hrQuery,
            hr: true,
            take: suggestionsTake - 1,
            include: session ? [session.user.id, ...(values.hrIds ?? [])] : values.hrIds,
        },
        useQueryOptions,
    );

    const vacanciesQuery = useVacancies({ archived: false, take: 5, search: vacancyQuery });
    const vacancies = vacanciesQuery.data?.pages[0].vacancies ?? [];

    const onResetFilers = () => {
        setHireStreamQuery('');
        setHrQuery('');
        setVacancyQuery('');
        setInterviewStatusLocal([]);
        setHrIdsLocal([]);
        setHireStreamIdsLocal([]);
        setVacancyIdsLocal([]);
        clearParams();
    };

    const candidatesQuery = useCandidates(candidateFilterValuesToRequestData(values));

    return (
        <>
            <FiltersPanelContainer loading={loading}>
                <FiltersPanelContent>
                    <FiltersSearchContainer>
                        <Input
                            placeholder={tr('Search')}
                            defaultValue={values.search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </FiltersSearchContainer>
                    <FiltersCounterContainer>
                        <FiltersCounter
                            total={candidatesQuery.data?.pages[0].total ?? 0}
                            counter={candidatesQuery.data?.pages[0].count}
                        />
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
                    hrIds={values.hrIds}
                    interviewStatuses={interviewStatusLocal}
                    hireStreams={hireStreams}
                    hireStreamIds={values.hireStreamIds}
                    vacancies={vacancies}
                    vacancyIds={values.vacancyIds}
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
                    value={interviewStatusLocal}
                    items={interviewStatuses.map((status) => ({ id: status, name: status }))}
                    filterCheckboxName="interviewStatus"
                    onChange={setInterviewStatusLocal}
                    viewMode="union"
                />
                <Filter
                    title={tr('Suggestions')}
                    tabName="hireStream"
                    label={tr('Hire streams')}
                    placeholder={tr('Search')}
                    value={hireStreamIdsLocal?.map((i) => String(i))}
                    items={hireStreams.map((tag) => ({ id: String(tag.id), name: tag.name }))}
                    filterCheckboxName="hireStream"
                    onChange={(v) => setHireStreamIdsLocal(v.map(Number))}
                    onSearchChange={setHireStreamQuery}
                    viewMode="split"
                />
                <Filter
                    title={tr('Suggestions')}
                    tabName="hrs"
                    label={tr("HR's")}
                    placeholder={tr('Search')}
                    value={hrIdsLocal?.map((i) => String(i))}
                    items={hrs.map((hr) => ({
                        id: String(hr.id),
                        name: `${hr.name || hr.email} ${hr.id === session?.user.id ? tr('(You)') : ''}`,
                        email: hr.email,
                    }))}
                    filterCheckboxName="hrs"
                    onChange={(v) => setHrIdsLocal(v.map(Number))}
                    onSearchChange={setHrQuery}
                    viewMode="split"
                />
                <Filter
                    title={tr('Suggestions')}
                    tabName="vacancies"
                    label={tr('Vacancies')}
                    placeholder={tr('Search')}
                    value={vacancyIdsLocal}
                    items={vacancies.map((vacancy) => ({
                        id: vacancy.id,
                        name: vacancyToString(vacancy),
                    }))}
                    filterCheckboxName="vacancies"
                    onChange={(v) => setVacancyIdsLocal(v)}
                    onSearchChange={setVacancyQuery}
                    viewMode="split"
                />
            </FilterPopup>
        </>
    );
};
