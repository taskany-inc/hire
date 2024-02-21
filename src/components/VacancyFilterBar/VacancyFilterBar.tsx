import { ReactNode, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import {
    Button,
    FilterPopup,
    FiltersApplied,
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
import { gapS, gray7 } from '@taskany/colors';

import { Filter } from '../Filter';
import { useVacancyFilterContext } from '../../contexts/vacancyFilterContext';
import { mapEnum } from '../../utils';
import { VacancyStatus, vacancyLabels } from '../../modules/crewTypes';
import { useHireStreams } from '../../modules/hireStreamsHooks';
import { useVacancies } from '../../modules/crewHooks';

import { tr } from './VacancyFilterBar.i18n';

const VacancyFilterApplied = () => {
    const { statuses, hireStreamIds } = useVacancyFilterContext();
    const hireStreamsQuery = useHireStreams();

    const applied = useMemo(() => {
        const hireStreams = hireStreamsQuery.data ?? [];
        let result = '';

        if (statuses?.length) {
            result += `${tr('Status')}: ${statuses.map((s) => vacancyLabels[s]).join(', ')}.`;
        }

        if (hireStreamIds?.length) {
            result += `${tr('Streams')}: ${hireStreamIds
                .map((id) => hireStreams.find((s) => String(s.id) === id))
                .map((s) => s?.name)
                .join(', ')}.`;
        }

        return result;
    }, [statuses, hireStreamIds, hireStreamsQuery.data]);

    return (
        <FiltersApplied size="s" weight="bold" color={gray7}>
            {applied}
        </FiltersApplied>
    );
};

interface VacancyFilterBarProps {
    children?: ReactNode;
}

const StyledFiltersSearchContainer = styled(FiltersSearchContainer)`
    width: unset;
`;

const StyledResetButton = styled(Button)`
    margin-left: auto;
    margin-right: ${gapS};
`;

export const VacancyFilterBar = ({ children }: VacancyFilterBarProps) => {
    const { search, debouncedSearch, setSearch, statuses, setStatuses, hireStreamIds, setHireStreamIds } =
        useVacancyFilterContext();
    const vacanciesQuery = useVacancies({
        archived: false,
        statuses,
        search: debouncedSearch,
        hireStreamIds,
    });
    const count = vacanciesQuery.data?.pages.at(-1)?.count;
    const total = vacanciesQuery.data?.pages.at(-1)?.total ?? 0;

    const filterNodeRef = useRef<HTMLSpanElement>(null);
    const [filterVisible, setFilterVisible] = useState(false);

    const [localStatuses, setLocalStatuses] = useState(statuses);
    const [localHireStreamIds, setLocalHireStreamIds] = useState(hireStreamIds);

    const isFiltersEmpty = !localStatuses && !localHireStreamIds;

    const onApplyClick = () => {
        setFilterVisible(false);
        setStatuses(localStatuses);
        setHireStreamIds(localHireStreamIds);
    };

    const onStatusChange = (items: string[]) => {
        if (items.length === 0) {
            setLocalStatuses(undefined);
        } else {
            setLocalStatuses(items as VacancyStatus[]);
        }
    };

    const onHireStreamChange = (items: string[]) => {
        if (items.length === 0) {
            setLocalHireStreamIds(undefined);
        } else {
            setLocalHireStreamIds(items);
        }
    };

    const onFilterReset = () => {
        setSearch(undefined);
        setStatuses(undefined);
        setLocalStatuses(undefined);
        setHireStreamIds(undefined);
        setLocalHireStreamIds(undefined);
    };

    const hireStreamsQuery = useHireStreams();
    const hireStreamItems = hireStreamsQuery.data?.map((s) => ({ id: String(s.id), name: s.name })) ?? [];

    return (
        <>
            <FiltersPanelContainer>
                <FiltersPanelContent>
                    <StyledFiltersSearchContainer>
                        <Input
                            placeholder={tr('Search')}
                            value={search ?? ''}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </StyledFiltersSearchContainer>

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
                    <StyledResetButton text={tr('Reset')} onClick={onFilterReset} />
                </FiltersPanelContent>
            </FiltersPanelContainer>

            {nullable(!isFiltersEmpty, () => (
                <VacancyFilterApplied />
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
                    value={localStatuses}
                    items={mapEnum(VacancyStatus, (s) => ({ id: s, name: vacancyLabels[s] }))}
                    filterCheckboxName="statuses"
                    onChange={onStatusChange}
                    viewMode="union"
                />

                <Filter
                    tabName="hireStreams"
                    label={tr('Streams')}
                    value={localHireStreamIds}
                    items={hireStreamItems}
                    filterCheckboxName="hireStreams"
                    onChange={onHireStreamChange}
                    viewMode="union"
                />
            </FilterPopup>
        </>
    );
};
