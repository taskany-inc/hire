import React, { ChangeEventHandler, useCallback, useRef, useState } from 'react';
import { HireStream } from '@prisma/client';
import {
    FilterPopup,
    FiltersMenuContainer,
    FiltersMenuItem,
    FiltersPanelContainer,
    FiltersPanelContent,
    FilterTabLabel,
    FormTitle,
    Modal,
    ModalContent,
    ModalHeader,
    nullable,
    Tab,
} from '@taskany/bricks';
import { Button, RadioControl, RadioGroup } from '@taskany/bricks/harmony';

import { CustomPeriodForm } from '../CustomPeriodForm/CustomPeriodForm';
import { useAnalyticsFilterUrlParams } from '../../hooks/useAnalyticsFilterUrlParams';
import { Filter } from '../Filter';
import { AnalyticsFilterApplied } from '../AnalyticsFilterApplied/AnalyticsFilterApplied';

import { I18nKey, tr } from './AnalyticsFilterMenuBar.i18n';

interface AnalyticsFilterMenuBarPropsType {
    hireStreams?: HireStream[];
}

export const AnalyticsFilterMenuBar = ({ hireStreams }: AnalyticsFilterMenuBarPropsType): JSX.Element => {
    const {
        setMonth,
        setQuarter,
        setYear,
        setWeek,
        periodTitle,
        hireStreams: selectedHireStreams,
        setHireStreams,
    } = useAnalyticsFilterUrlParams(hireStreams);

    const filterNodeRef = useRef<HTMLSpanElement>(null);
    const [openCustomPeriod, setCustomPeriod] = useState(false);
    const [filterVisible, setFilterVisible] = useState(false);
    const [hasPeriodBeenSelected, setHasPeriodBeenSelected] = useState(false);
    const [periodFilter, setPeriodFFilter] = useState<I18nKey>(periodTitle as I18nKey);
    const [streamsFilter, setStreamsFilter] = useState(() => selectedHireStreams.map(({ id }) => id.toString()));

    const isFiltersEmpty = !periodFilter && !selectedHireStreams.length;

    const onPeriodChange = useCallback(
        (periodTitle: string) => {
            if (periodTitle === 'Custom period') setCustomPeriod(true);

            if (periodTitle === 'Week') return setWeek();

            if (periodTitle === 'Month') return setMonth();

            if (periodTitle === 'Quarter') return setQuarter();
            setYear();
        },
        [setMonth, setQuarter, setWeek, setYear],
    );

    const onApplyClick = useCallback(() => {
        if (hasPeriodBeenSelected) {
            onPeriodChange(periodFilter);
            setHasPeriodBeenSelected(false);
        }
        setHireStreams(hireStreams?.filter(({ id }) => streamsFilter.includes(id.toString())) ?? []);
        setFilterVisible(false);
    }, [hasPeriodBeenSelected, setHireStreams, hireStreams, onPeriodChange, periodFilter, streamsFilter]);

    const onChangePeriod: ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
        setHasPeriodBeenSelected(true);
        setPeriodFFilter(e.target.value as I18nKey);
    }, []);

    const onResetClick = useCallback(() => {
        setHireStreams([]);
        setStreamsFilter([]);
    }, [setHireStreams]);
    const periodKey = (hasPeriodBeenSelected ? periodFilter : periodTitle) as I18nKey;

    const periodMap: Partial<Record<I18nKey, string>> = {
        'Custom period': tr('Custom period'),
        Year: tr('Year'),
        Weak: tr('Weak'),
        Month: tr('Month'),
        Quarter: tr('Quarter'),
    };

    const period = periodMap[periodKey] ?? periodKey;

    return (
        <>
            <FiltersPanelContainer>
                <FiltersPanelContent>
                    <FiltersMenuContainer>
                        <FiltersMenuItem ref={filterNodeRef} onClick={() => setFilterVisible((p) => !p)}>
                            {tr('Filter')}
                        </FiltersMenuItem>
                    </FiltersMenuContainer>
                    <Button onClick={onResetClick} text={tr('Reset')} />
                </FiltersPanelContent>
            </FiltersPanelContainer>
            {nullable(!isFiltersEmpty, () => (
                <AnalyticsFilterApplied hireStreams={selectedHireStreams} periodTitle={period} />
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
                {nullable(hireStreams, (st) => (
                    <Filter
                        tabName="streams"
                        label={tr('Streams')}
                        value={streamsFilter}
                        items={st.map(({ id, name }) => ({ id: id.toString(), name })) ?? []}
                        filterCheckboxName="streams"
                        onChange={setStreamsFilter}
                        viewMode="union"
                    />
                ))}

                <Tab name="period" label={<FilterTabLabel text={tr('Period')} selected={[period]} />}>
                    <RadioGroup name="period" value={periodFilter} onChange={onChangePeriod}>
                        <RadioControl value="Weak">{tr('Weak')}</RadioControl>
                        <RadioControl value="Month">{tr('Month')}</RadioControl>
                        <RadioControl value="Quarter">{tr('Quarter')}</RadioControl>
                        <RadioControl value="Year">{tr('Year')}</RadioControl>
                        <RadioControl value="Custom period">{tr('Custom period')}</RadioControl>
                    </RadioGroup>
                </Tab>
            </FilterPopup>
            <Modal width={500} visible={openCustomPeriod} onClose={() => setCustomPeriod(false)}>
                <ModalHeader>
                    <FormTitle>{tr('Custom period')}</FormTitle>
                </ModalHeader>
                <ModalContent>
                    <CustomPeriodForm close={() => setCustomPeriod(false)} />
                </ModalContent>
            </Modal>
        </>
    );
};
