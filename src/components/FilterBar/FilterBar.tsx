import React, { ComponentProps, useCallback, useMemo, useState } from 'react';
import { nullable } from '@taskany/bricks';
import {
    Button,
    FiltersBar,
    FiltersBarItem,
    FiltersBarControlGroup,
    Input,
    FiltersBarCounter,
    FiltersBarTitle,
    Separator,
} from '@taskany/bricks/harmony';

import { AppliedUserFilter } from '../AppliedUserFilter/AppliedUserFilter';
import { AppliedProblemTagsFilter } from '../AppliedProblemTagsFilter/AppliedProblemTagsFilter';
import { AppliedProblemDifficultyFilter } from '../AppliedProblemDifficultyFilter/AppliedProblemDifficultyFilter';
import { AppliedStatusFilter } from '../AppliedStatusFilter/AppliedStatusFilter';
import { AppliedHireStreamFilter } from '../AppliedHireStreamFilter/AppliedHireStreamFilter';
import { AppliedDateFilter } from '../AppliedDateFilter/AppliedDateFilter';
import { HeaderUserMenu } from '../HeaderUserMenu/HeaderUserMenu';
import { AddFilterDropdown } from '../AddFilterDropdown';
import { AppliedVacanciesFilter } from '../AppliedVacanciesFilter/AppliedVacanciesFilter';
import { AppliedSectionTypesFilter } from '../AppliedSectionTypesFilter/AppliedSectionTypesFilter';

import { tr } from './FilterBar.i18n';
import s from './FilterBar.module.css';

interface FiltersValues {
    difficulty: ComponentProps<typeof AppliedProblemDifficultyFilter>['selectedDifficulties'];
    author: ComponentProps<typeof AppliedUserFilter>['selectedUsers'];
    hrIds: ComponentProps<typeof AppliedUserFilter>['selectedUsers'];
    tag: ComponentProps<typeof AppliedProblemTagsFilter>['selectedTags'];
    statuses: ComponentProps<typeof AppliedStatusFilter>['selectedStatuses'];
    hireStreamIds: ComponentProps<typeof AppliedHireStreamFilter>['selectedHireStreams'];
    vacancyIds: ComponentProps<typeof AppliedVacanciesFilter>['selectedVancies'];
    createdAt: ComponentProps<typeof AppliedDateFilter>['value'];
    sectionTypeIds: ComponentProps<typeof AppliedSectionTypesFilter>['selectedSectionTypes'];
    interviewerIds: ComponentProps<typeof AppliedUserFilter>['selectedUsers'];
}

type AvaliableKeys = keyof FiltersValues;

interface FilterBarProps<K extends AvaliableKeys, V extends Pick<FiltersValues, K>> {
    title?: string;
    total?: number;
    count?: number;
    search?: string;
    setSearch: (val: string) => void;
    setter: (key: K, val?: V[K]) => void;
    values: Partial<V>;
    clearParams: () => void;
}

export const FilterBar = <K extends AvaliableKeys>({
    title,
    total,
    count,
    values,
    search,
    setSearch,
    setter,
    clearParams,
}: FilterBarProps<K, Pick<FiltersValues, K>>) => {
    const [filtersState, setFiltersState] = useState<Partial<FiltersValues> | undefined>(values);

    const filterItems = useMemo(() => {
        const items = [
            { id: 'difficulty', title: tr('Difficulty') },
            { id: 'tag', title: tr('Tags') },
            { id: 'author', title: tr('Author') },
            { id: 'statuses', title: tr('Status') },
            { id: 'hireStreamIds', title: tr('Hire streams') },
            { id: 'hrIds', title: tr("HR's") },
            { id: 'interviewerIds', title: tr('Interviewers') },
            { id: 'vacancyIds', title: tr('Vacancies') },
            { id: 'createdAt', title: tr('Created аt') },
            { id: 'sectionTypeIds', title: tr('Section type') },
        ];

        return items.filter(({ id }) => id in values) as { id: K; title: string }[];
    }, [values]);

    const restFilterItems = useMemo(() => {
        return filterItems.filter((item) => !filtersState?.[item.id]);
    }, [filterItems, filtersState]);

    const setPartialQueryByKey = useCallback((key: K) => {
        return (value?: FiltersValues[K]) => {
            setFiltersState((prev) => {
                return {
                    ...prev,
                    [key]: value,
                };
            });
        };
    }, []);

    const handleChange = useCallback(
        (key: K) => (values?: { id: number | string }[]) => {
            setPartialQueryByKey(key)(values?.map(({ id }) => id) as FiltersValues[K]);
        },
        [setPartialQueryByKey],
    );

    const isFiltersEmpty = useMemo(
        () => Object.values(filtersState || {}).filter(Boolean).length === 0,
        [filtersState],
    );

    const keys = useMemo(() => Object.keys(values) as K[], [values]);

    const onApply = useCallback(() => {
        keys.forEach((key) => {
            setter(key, filtersState?.[key]);
        });
    }, [setter, keys, filtersState]);

    const onCleanFilter = useCallback(
        (key: K) => () => {
            setPartialQueryByKey(key)(undefined);
            setter(key, undefined);
        },
        [setPartialQueryByKey, setter],
    );

    const onResetFilers = () => {
        clearParams();
        setFiltersState(undefined);
    };

    return (
        <>
            <FiltersBar className={s.FilterBar}>
                {nullable(title, () => (
                    <>
                        <FiltersBarItem>
                            <FiltersBarTitle>{title}</FiltersBarTitle>
                        </FiltersBarItem>
                        <Separator />
                    </>
                ))}
                <FiltersBarItem>
                    <Input
                        placeholder={tr('Search')}
                        defaultValue={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </FiltersBarItem>
                <FiltersBarItem>
                    <FiltersBarControlGroup>
                        {nullable(
                            isFiltersEmpty,
                            () => (
                                <AddFilterDropdown
                                    title={tr('Filter')}
                                    items={restFilterItems}
                                    onChange={([item]) => setPartialQueryByKey(item.id)([])}
                                />
                            ),
                            <Button text={tr('Reset')} onClick={onResetFilers} />,
                        )}
                        <FiltersBarCounter total={total} counter={count} />
                    </FiltersBarControlGroup>
                </FiltersBarItem>
                <FiltersBarItem className={s.FilterUserMenu}>
                    <HeaderUserMenu />
                </FiltersBarItem>
            </FiltersBar>
            {nullable(!isFiltersEmpty, () => (
                <FiltersBar className={s.FilterBarApplied}>
                    {keys.map((key) => {
                        if (key === 'difficulty') {
                            return nullable(Boolean(filtersState?.difficulty), () => (
                                <AppliedProblemDifficultyFilter
                                    key={key}
                                    onChange={handleChange(key)}
                                    onClose={onApply}
                                    onCleanFilter={onCleanFilter(key)}
                                    selectedDifficulties={filtersState?.difficulty}
                                />
                            ));
                        }

                        if (key === 'author') {
                            return nullable(Boolean(filtersState?.author), () => (
                                <AppliedUserFilter
                                    key={key}
                                    label={tr('Author')}
                                    selectedUsers={filtersState?.author}
                                    onChange={handleChange(key)}
                                    onClose={onApply}
                                    onCleanFilter={onCleanFilter(key)}
                                />
                            ));
                        }

                        if (key === 'hrIds') {
                            return nullable(Boolean(filtersState?.hrIds), () => (
                                <AppliedUserFilter
                                    key={key}
                                    hr
                                    label={tr("HR's")}
                                    selectedUsers={filtersState?.hrIds}
                                    onChange={handleChange(key)}
                                    onClose={onApply}
                                    onCleanFilter={onCleanFilter(key)}
                                />
                            ));
                        }

                        if (key === 'tag') {
                            return nullable(Boolean(filtersState?.tag), () => (
                                <AppliedProblemTagsFilter
                                    key={key}
                                    onCleanFilter={onCleanFilter(key)}
                                    selectedTags={filtersState?.tag}
                                    onChange={handleChange(key)}
                                    onClose={onApply}
                                />
                            ));
                        }

                        if (key === 'statuses') {
                            return nullable(Boolean(filtersState?.statuses), () => (
                                <AppliedStatusFilter
                                    key={key}
                                    onChange={handleChange(key)}
                                    onClose={onApply}
                                    onCleanFilter={onCleanFilter(key)}
                                    selectedStatuses={filtersState?.statuses}
                                />
                            ));
                        }

                        if (key === 'hireStreamIds') {
                            return nullable(Boolean(filtersState?.hireStreamIds), () => (
                                <AppliedHireStreamFilter
                                    key={key}
                                    onChange={handleChange(key)}
                                    onClose={onApply}
                                    onCleanFilter={onCleanFilter(key)}
                                    selectedHireStreams={filtersState?.hireStreamIds}
                                />
                            ));
                        }
                        if (key === 'vacancyIds') {
                            return nullable(Boolean(filtersState?.vacancyIds), () => (
                                <AppliedVacanciesFilter
                                    key={key}
                                    onChange={handleChange(key)}
                                    onClose={onApply}
                                    onCleanFilter={onCleanFilter(key)}
                                    selectedVancies={filtersState?.vacancyIds}
                                />
                            ));
                        }

                        if (key === 'createdAt') {
                            return nullable(Boolean(filtersState?.createdAt), () => (
                                <AppliedDateFilter
                                    title={tr('Created аt')}
                                    key={key}
                                    onChange={handleChange(key)}
                                    onClose={onApply}
                                    onCleanFilter={onCleanFilter(key)}
                                    value={filtersState?.createdAt}
                                />
                            ));
                        }

                        if (key === 'sectionTypeIds') {
                            return nullable(Boolean(filtersState?.sectionTypeIds), () => (
                                <AppliedSectionTypesFilter
                                    key={key}
                                    onChange={handleChange(key)}
                                    onClose={onApply}
                                    onCleanFilter={onCleanFilter(key)}
                                    selectedSectionTypes={filtersState?.sectionTypeIds}
                                />
                            ));
                        }
                        if (key === 'interviewerIds') {
                            return nullable(Boolean(filtersState?.interviewerIds), () => (
                                <AppliedUserFilter
                                    key={key}
                                    onCleanFilter={onCleanFilter(key)}
                                    selectedUsers={filtersState?.interviewerIds}
                                    onChange={handleChange(key)}
                                    onClose={onApply}
                                    label="Interviewers"
                                />
                            ));
                        }
                        return null;
                    })}
                    <AddFilterDropdown
                        title={tr('Filter')}
                        items={restFilterItems}
                        onChange={([item]) => setPartialQueryByKey(item.id)([])}
                    />
                </FiltersBar>
            ))}
        </>
    );
};
