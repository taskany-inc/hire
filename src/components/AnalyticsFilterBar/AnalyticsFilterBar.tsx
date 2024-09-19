import React, { ComponentProps, useCallback, useMemo, useState } from 'react';
import { HireStream } from '@prisma/client';
import { nullable } from '@taskany/bricks';
import {
    Button,
    FiltersBar,
    FiltersBarItem,
    FiltersBarControlGroup,
    FiltersBarTitle,
    Separator,
} from '@taskany/bricks/harmony';

import { useAnalyticsFilterUrlParams } from '../../hooks/useAnalyticsFilterUrlParams';
import { AddFilterDropdown } from '../AddFilterDropdown';
import { AppliedAnalyticsPeriodFilter } from '../AppliedAnalyticsPeriodFilter/AppliedAnalyticsPeriodFilter';
import { AppliedAnalyticsStreamsFilter } from '../AppliedAnalyticsStreamsFilter/AppliedAnalyticsStreamsFilter';

import { tr } from './AnalyticsFilterBar.i18n';
import s from './AnalyticsFilterBar.module.css';

interface AnalyticsFilterBarProps {
    title?: string;
    hireStreams: HireStream[];
}

export const AnalyticsFilterBar = ({ title, hireStreams }: AnalyticsFilterBarProps): JSX.Element => {
    const { values, setter, clearParams, setPeriod, isFiltersEmpty } = useAnalyticsFilterUrlParams(hireStreams);

    const [showStreamsDropdown, setShowStreamsDropdown] = useState(Boolean(values.streams));
    const [showPeriodDropdown, setShowPeriodDropdown] = useState(Boolean(values.period));

    const unusedFilterItems = useMemo(() => {
        const items = [];
        if (!values.streams && !showStreamsDropdown) items.push({ id: 'streams', title: tr('Streams') });
        if (!values.period && !showPeriodDropdown) items.push({ id: 'period', title: tr('Period') });
        return items;
    }, [values, showStreamsDropdown, showPeriodDropdown]);

    const resetFilters = useCallback(() => {
        setShowStreamsDropdown(false);
        setShowStreamsDropdown(false);
        clearParams();
    }, [clearParams]);

    const onAddFilter: ComponentProps<typeof AddFilterDropdown>['onChange'] = ([value]) => {
        if (value.id === 'streams') setShowStreamsDropdown(true);
        if (value.id === 'period') setShowPeriodDropdown(true);
    };

    return (
        <>
            <FiltersBar className={s.AnalyticsFilterBar}>
                {nullable(title, (t) => (
                    <>
                        <FiltersBarItem>
                            <FiltersBarTitle>{t}</FiltersBarTitle>
                        </FiltersBarItem>
                        <Separator />
                    </>
                ))}
                <FiltersBarItem>
                    <FiltersBarControlGroup>
                        {nullable(
                            isFiltersEmpty && !showStreamsDropdown && !showPeriodDropdown,
                            () => (
                                <AddFilterDropdown
                                    title={tr('Filter')}
                                    items={unusedFilterItems}
                                    onChange={onAddFilter}
                                />
                            ),
                            <Button text={tr('Reset')} onClick={resetFilters} />,
                        )}
                    </FiltersBarControlGroup>
                </FiltersBarItem>
            </FiltersBar>

            {nullable(showStreamsDropdown || showPeriodDropdown, () => (
                <FiltersBar className={s.AnalyticsFilterBarApplied}>
                    {nullable(showPeriodDropdown, () => (
                        <AppliedAnalyticsPeriodFilter
                            period={values.period || (values.startDate && 'custom')}
                            setPeriod={(period) => setPeriod(period)}
                            onClearFilter={() => {
                                setShowPeriodDropdown(false);
                                setPeriod(undefined);
                            }}
                        />
                    ))}
                    {nullable(showStreamsDropdown, () => (
                        <AppliedAnalyticsStreamsFilter
                            hireStreams={hireStreams}
                            selected={values.streams}
                            setStreams={(streams) => {
                                setter(
                                    'streams',
                                    streams?.map((s) => s.id),
                                );
                            }}
                            onClearFilter={() => {
                                setShowStreamsDropdown(false);
                                setter('streams', undefined);
                            }}
                        />
                    ))}
                    <AddFilterDropdown title={tr('Filter')} items={unusedFilterItems} onChange={onAddFilter} />
                </FiltersBar>
            ))}
        </>
    );
};
