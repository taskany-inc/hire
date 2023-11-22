import React, { useState } from 'react';
import { HireStream } from '@prisma/client';
import { FormTitle, Modal, ModalContent, ModalHeader } from '@taskany/bricks';

import { useAnalyticsFilterContext } from '../../contexts/analyticsFilterContext';
import { FiltersPanel } from '../FiltersPanel/FiltersPanel';
import { CustomPeriodForm } from '../CustomPeriodForm/CustomPeriodForm';

import { tr } from './AnalyticsFilterMenuBar.i18n';

type AnalyticsFilterMenuBarPropsType = {
    hireStreams?: HireStream[];
};

export const AnalyticsFilterMenuBar = ({ hireStreams }: AnalyticsFilterMenuBarPropsType): JSX.Element => {
    const {
        setMonth,
        setQuarter,
        setYear,
        setWeek,
        periodTitle,
        hireStreams: selectedHireStreams,
        setHireStreams,
        clearFilters,
    } = useAnalyticsFilterContext();

    const [openCustomPeriod, setCustomPeriod] = useState(false);

    const periods = [tr('Week'), tr('Month'), tr('Quarter'), tr('Year'), tr('Custom')];

    const onPeriodChange = (periodTitle: string) => {
        if (periodTitle === 'Custom') setCustomPeriod(true);

        if (periodTitle === 'Week') return setWeek();

        if (periodTitle === 'Month') return setMonth();

        if (periodTitle === 'Quarter') return setQuarter();
        setYear();
    };

    return (
        <FiltersPanel
            onClearFilters={clearFilters}
            streams={hireStreams}
            streamFilter={selectedHireStreams}
            onStreamChange={setHireStreams}
            periods={periods}
            onPeriodChange={onPeriodChange}
            periodFilter={periodTitle}
        >
            <Modal width={500} visible={openCustomPeriod} onClose={() => setCustomPeriod(false)}>
                <ModalHeader>
                    <FormTitle>{tr('Custom period')}</FormTitle>
                </ModalHeader>
                <ModalContent>
                    <CustomPeriodForm close={() => setCustomPeriod(false)} />
                </ModalContent>
            </Modal>
        </FiltersPanel>
    );
};
