import { ProblemDifficulty } from '@prisma/client';
import React, { ReactNode, useCallback, useMemo, useState } from 'react';
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

import { useProblemCount } from '../../modules/problemHooks';
import { useProblemFilterUrlParams } from '../../hooks/useProblemFilterUrlParams';
import { AppliedProblemAuthorsFilter } from '../AppliedProblemAuthorsFilter/AppliedProblemAuthorsFilter';
import { AppliedProblemTagsFilter } from '../AppliedProblemTagsFilter/AppliedProblemTagsFilter';
import { AppliedProblemDifficultyFilter } from '../AppliedProblemDifficultyFilter/AppliedProblemDifficultyFilter';
import { HeaderUserMenu } from '../HeaderUserMenu/HeaderUserMenu';
import { AddFilterDropdown } from '../AddFilterDropdown';

import { tr } from './ProblemFilterBar.i18n';
import s from './ProblemFilterBar.module.css';

interface ProblemFilterBarProps {
    embedded?: boolean;
    loading?: boolean;
    children?: ReactNode;
    title?: string;
}

export const ProblemFilterBar = ({ title }: ProblemFilterBarProps) => {
    const { values, setter, setSearch, clearParams } = useProblemFilterUrlParams();

    const filterItems = useMemo<{ id: keyof typeof values; title: string }[]>(() => {
        return [
            { id: 'difficulty', title: tr('Difficulty') },
            { id: 'tag', title: tr('Tags') },
            { id: 'author', title: tr('Author') },
        ];
    }, []);

    const [filtersState, setFiltersState] = useState<Partial<typeof values> | undefined>(values);

    const restFilterItems = useMemo(() => {
        return filterItems.filter((item) => !filtersState?.[item.id]);
    }, [filterItems, filtersState]);

    const setPartialQueryByKey = useCallback(<K extends keyof typeof values>(key: K) => {
        return (value?: (typeof values)[K]) => {
            setFiltersState((prev) => {
                return {
                    ...prev,
                    [key]: value,
                };
            });
        };
    }, []);
    // console.log(filtersState);

    const handleChange = useCallback(
        <T extends { id: string }>(key: keyof typeof values) =>
            (values?: T[]) => {
                if (key === 'author' || key === 'tag') {
                    setPartialQueryByKey(key)(values?.map(({ id }) => +id));
                } else {
                    setPartialQueryByKey(key)(values?.map(({ id }) => id));
                }
            },
        [setPartialQueryByKey],
    );

    const problemCountQuery = useProblemCount({
        search: values.search,
        difficulty: values.difficulty as ProblemDifficulty[],
        tagIds: values.tag,
        authorIds: values.author,
    });

    const isFiltersEmpty = useMemo(
        () => Object.values(filtersState || {}).filter(Boolean).length === 0,
        [filtersState],
    );

    const onApply = useCallback(() => {
        setter('author', filtersState?.author);
        setter('difficulty', filtersState?.difficulty);
        setter('tag', filtersState?.tag);
    }, [setter, filtersState?.author, filtersState?.difficulty, filtersState?.tag]);

    const onCleanFilter = useCallback(
        (key: keyof typeof values) => () => {
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
            <FiltersBar>
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
                        defaultValue={values.search}
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
                        <FiltersBarCounter
                            total={problemCountQuery.data?.total}
                            counter={problemCountQuery.data?.count}
                        />
                    </FiltersBarControlGroup>
                </FiltersBarItem>
                <FiltersBarItem className={s.ProblemFilterUserMenu}>
                    <HeaderUserMenu />
                </FiltersBarItem>
            </FiltersBar>
            {nullable(!isFiltersEmpty, () => (
                <FiltersBar className={s.ProblemFilterBarApplied}>
                    {nullable(Boolean(filtersState?.difficulty), () => (
                        <AppliedProblemDifficultyFilter
                            onChange={handleChange('difficulty')}
                            onClose={onApply}
                            onCleanFilter={onCleanFilter('difficulty')}
                            selectedDifficulties={filtersState?.difficulty}
                        />
                    ))}
                    {nullable(Boolean(filtersState?.author), () => (
                        <AppliedProblemAuthorsFilter
                            selectedAuthors={filtersState?.author}
                            onChange={handleChange('author')}
                            onClose={onApply}
                            onCleanFilter={onCleanFilter('author')}
                        />
                    ))}
                    {nullable(Boolean(filtersState?.tag), () => (
                        <AppliedProblemTagsFilter
                            onCleanFilter={onCleanFilter('tag')}
                            selectedTags={filtersState?.tag}
                            onChange={handleChange('tag')}
                            onClose={onApply}
                        />
                    ))}
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
