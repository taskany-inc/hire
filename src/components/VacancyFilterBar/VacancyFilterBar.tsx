import { ReactNode, useMemo, useRef, useState } from 'react';
import {
    FilterPopup,
    FiltersCounter,
    FiltersCounterContainer,
    FiltersMenuContainer,
    FiltersMenuItem,
    FiltersPanelContainer,
    FiltersPanelContent,
    FiltersSearchContainer,
    Input,
    nullable,
} from '@taskany/bricks';
import { Button } from '@taskany/bricks/harmony';

import { Filter } from '../Filter';
import { mapEnum } from '../../utils';
import { VacancyStatus, vacancyLabels } from '../../modules/crewTypes';
import { useVacancies } from '../../modules/crewHooks';
import { suggestionsTake, useQueryOptions } from '../../utils/suggestions';
import { trpc } from '../../trpc/trpcClient';
import { VacancyFilterApplied } from '../VacancyFilterApplied/VacancyFilterApplied';
import { DatesFilter } from '../DateFilter/DatesFilter';
import { useSession } from '../../contexts/appSettingsContext';
import { useVacancyFilterUrlParams, vacancyFilterValuesToRequestData } from '../../hooks/useVacancyFilterUrlParams';

import s from './VacancyFilterBar.module.css';
import { tr } from './VacancyFilterBar.i18n';

interface VacancyFilterBarProps {
    children?: ReactNode;
}

export const VacancyFilterBar = ({ children }: VacancyFilterBarProps) => {
    const session = useSession();

    const { values, setter, clearParams, setSearch } = useVacancyFilterUrlParams();

    const vacanciesQuery = useVacancies(vacancyFilterValuesToRequestData(values));
    const count = vacanciesQuery.data?.pages.at(-1)?.count;
    const total = vacanciesQuery.data?.pages.at(-1)?.total ?? 0;

    const filterNodeRef = useRef<HTMLSpanElement>(null);
    const [filterVisible, setFilterVisible] = useState(false);

    const [statusesLocal, setStatusesLocal] = useState(values.statuses);
    const [hireStreamIdsLocal, setHireStreamIdsLocal] = useState(values.hireStreamIds);
    const [hrEmailsLocal, setHrEmailsLocal] = useState(values.hrEmails);
    const [hiringManagerEmailsLocal, setHiringManagerEmailsLocal] = useState(values.hiringManagerEmails);
    const [teamIdsLocal, setTeamIdsLocal] = useState(values.teamIds);
    const [startDateLocal, setStartDateLocal] = useState<Date | undefined>(
        values.closedAtStart ? new Date(values.closedAtStart) : undefined,
    );

    const [endDateLocal, setEndDateLocal] = useState<Date | undefined>(
        values.closedAtEnd ? new Date(values.closedAtEnd) : undefined,
    );

    const [hireStreamQuery, setHireStreamQuery] = useState('');
    const [hrQuery, setHrQuery] = useState('');
    const [hiringManagerQuery, setHiringManagerQuery] = useState('');
    const [teamQuery, setTeamQuery] = useState('');

    const isFiltersEmpty =
        !statusesLocal &&
        !hireStreamIdsLocal &&
        !hrEmailsLocal &&
        !hiringManagerEmailsLocal &&
        !teamIdsLocal &&
        !endDateLocal &&
        !startDateLocal;

    const onApplyClick = () => {
        setFilterVisible(false);
        setter('statuses', statusesLocal);
        setter('hireStreamIds', hireStreamIdsLocal);
        setter('hrEmails', hrEmailsLocal);
        setter('hiringManagerEmails', hiringManagerEmailsLocal);
        setter('teamIds', teamIdsLocal);
        endDateLocal && setter('closedAtEnd', endDateLocal.toISOString());

        startDateLocal && setter('closedAtStart', startDateLocal.toISOString());
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
            includeEmails: session ? [session.user.email, ...(values.hrEmails ?? [])] : values.hrEmails,
        },
        useQueryOptions,
    );

    const { data: hiringManagers = [] } = trpc.users.suggestions.useQuery(
        {
            query: hiringManagerQuery,
            take: suggestionsTake - 1,
            includeEmails: session ? [session.user.email, ...(values.hrEmails ?? [])] : values.hrEmails,
        },
        useQueryOptions,
    );

    const { data: teams = [] } = trpc.crew.getGroupList.useQuery(
        { search: teamQuery, take: suggestionsTake, filter: values.teamIds },
        useQueryOptions,
    );

    const onFilterReset = () => {
        setStatusesLocal([]);
        setHireStreamQuery('');
        setHireStreamIdsLocal([]);
        setHrEmailsLocal([]);
        setHrQuery('');
        setHiringManagerEmailsLocal([]);
        setHiringManagerQuery('');
        setTeamIdsLocal([]);
        setTeamQuery('');
        setStartDateLocal(undefined);
        setEndDateLocal(undefined);
        clearParams();
    };

    const hireStreamFilterItems = useMemo(
        () => hireStreams.map((hireStream) => ({ id: String(hireStream.id), name: hireStream.name })),
        [hireStreams],
    );

    const hrEmailFilterItems = useMemo(
        () =>
            hrs.map((hr) => ({
                id: hr.email,
                name: `${hr.name || hr.email} ${hr.id === session?.user.id ? tr('(You)') : ''}`,
                email: hr.email,
            })),
        [hrs, session?.user.id],
    );

    const hiringManagerEmailFilterItems = useMemo(
        () =>
            hiringManagers.map((hiringManager) => ({
                id: hiringManager.email,
                name: `${hiringManager.name || hiringManager.email} ${
                    hiringManager.id === session?.user.id ? tr('(You)') : ''
                }`,
                email: hiringManager.email,
            })),
        [hiringManagers, session?.user.id],
    );

    const teamFilterItems = useMemo(() => teams.map((team) => ({ id: team.id, name: team.name })), [teams]);

    return (
        <>
            <FiltersPanelContainer>
                <FiltersPanelContent>
                    <FiltersSearchContainer className={s.VacancyFilterBarFiltersSearchContainer}>
                        <Input
                            placeholder={tr('Search')}
                            defaultValue={values.search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </FiltersSearchContainer>

                    <FiltersCounterContainer>
                        <FiltersCounter counter={count} total={total} />
                    </FiltersCounterContainer>

                    <FiltersMenuContainer>
                        <FiltersMenuItem
                            ref={filterNodeRef}
                            active={!isFiltersEmpty}
                            onClick={() => setFilterVisible((v) => !v)}
                        >
                            {tr('Filter')}
                        </FiltersMenuItem>
                        {children}
                    </FiltersMenuContainer>
                    <Button className={s.VacancyFilterBarResetButton} text={tr('Reset')} onClick={onFilterReset} />
                </FiltersPanelContent>
            </FiltersPanelContainer>

            {nullable(!isFiltersEmpty, () => (
                <VacancyFilterApplied
                    hrs={hrs}
                    hrEmails={values.hrEmails}
                    statuses={statusesLocal}
                    hireStreams={hireStreams}
                    hireStreamIds={values.hireStreamIds}
                    hiringManagers={hiringManagers}
                    hiringManagerEmails={values.hiringManagerEmails}
                    teams={teams}
                    teamIds={values.teamIds}
                />
            ))}

            <FilterPopup
                visible={filterVisible}
                switchVisible={setFilterVisible}
                filterRef={filterNodeRef}
                onApplyClick={onApplyClick}
                cancelButtonText={tr('Cancel')}
                applyButtonText={tr('Apply')}
                activeTab="status"
            >
                <Filter
                    tabName="statuses"
                    label={tr('Status')}
                    value={statusesLocal}
                    items={mapEnum(VacancyStatus, (s) => ({ id: s, name: vacancyLabels[s] }))}
                    filterCheckboxName="statuses"
                    onChange={setStatusesLocal}
                    viewMode="union"
                />

                <Filter
                    title={tr('Suggestions')}
                    tabName="hireStream"
                    label={tr('Streams')}
                    placeholder={tr('Search')}
                    value={hireStreamIdsLocal?.map((i) => String(i))}
                    items={hireStreamFilterItems}
                    filterCheckboxName="hireStream"
                    onChange={(v) => setHireStreamIdsLocal(v.map(Number))}
                    onSearchChange={setHireStreamQuery}
                    viewMode="split"
                />

                <Filter
                    title={tr('Suggestions')}
                    tabName="teams"
                    label={tr('Teams')}
                    placeholder={tr('Search')}
                    value={teamIdsLocal}
                    items={teamFilterItems}
                    filterCheckboxName="teams"
                    onChange={(v) => setTeamIdsLocal(v)}
                    onSearchChange={setTeamQuery}
                    viewMode="split"
                />

                <Filter
                    title={tr('Suggestions')}
                    tabName="hrs"
                    label={tr("HR's")}
                    placeholder={tr('Search')}
                    value={hrEmailsLocal}
                    items={hrEmailFilterItems}
                    filterCheckboxName="hrs"
                    onChange={(v) => setHrEmailsLocal(v)}
                    onSearchChange={setHrQuery}
                    viewMode="split"
                />

                <Filter
                    title={tr('Suggestions')}
                    tabName="hiringManagers"
                    label={tr('Hiring Managers')}
                    placeholder={tr('Search')}
                    value={hiringManagerEmailsLocal}
                    items={hiringManagerEmailFilterItems}
                    filterCheckboxName="hiringManagers"
                    onChange={(v) => setHiringManagerEmailsLocal(v)}
                    onSearchChange={setHiringManagerQuery}
                    viewMode="split"
                />
                <DatesFilter
                    tabName="ClosedAt"
                    label={tr('Vacancy closed at')}
                    startDate={startDateLocal}
                    endDate={endDateLocal}
                    setStartDate={setStartDateLocal}
                    setEndDate={setEndDateLocal}
                />
            </FilterPopup>
        </>
    );
};
