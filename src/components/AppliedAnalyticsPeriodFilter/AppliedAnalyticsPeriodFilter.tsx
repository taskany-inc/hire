import { useState } from 'react';
import {
    AppliedFilter,
    Text,
    Select,
    SelectPanel,
    SelectTrigger,
    TagCleanButton,
    Modal,
    ModalHeader,
    ModalContent,
} from '@taskany/bricks/harmony';
import { nullable } from '@taskany/bricks';

import { AnalyticsPeriod } from '../../hooks/useAnalyticsFilterUrlParams';
import { CustomPeriodForm } from '../CustomPeriodForm/CustomPeriodForm';
import { objKeys } from '../../utils';

import { tr } from './AppliedAnalyticsPeriodFilter.i18n';

interface AppliedAnalyticsPeriodFilterProps {
    period?: AnalyticsPeriod | 'custom';
    setPeriod: (period: AnalyticsPeriod) => void;
    onClearFilter: VoidFunction;
}

export const AppliedAnalyticsPeriodFilter = ({
    period,
    setPeriod,
    onClearFilter,
}: AppliedAnalyticsPeriodFilterProps) => {
    const periodMap: Record<AnalyticsPeriod | 'custom', string> = {
        year: tr('Year'),
        quarter: tr('Quarter'),
        month: tr('Month'),
        week: tr('Week'),
        custom: tr('Custom'),
    };
    const items = objKeys(periodMap).map((k) => ({ id: k, name: periodMap[k] }));
    const value = period ? [{ id: period, name: periodMap[period] }] : [];

    const [showCustomModal, setShowCustomModal] = useState(false);

    return (
        <>
            <AppliedFilter label={tr('Period')} action={<TagCleanButton size="s" onClick={onClearFilter} />}>
                <Select
                    arrow
                    items={items}
                    mode="single"
                    selectable
                    renderItem={({ item }) => (
                        <Text size="s" weight="semiBold" as="span">
                            {item.name}
                        </Text>
                    )}
                    onChange={([item]) => {
                        if (item.id === 'custom') {
                            setShowCustomModal(true);
                        } else {
                            setPeriod(item.id);
                        }
                    }}
                    value={value}
                >
                    <SelectTrigger>
                        {nullable(value.length > 0 && value, ([item]) => (
                            <Text size="s" title={item.name}>
                                {item.name}
                            </Text>
                        ))}
                    </SelectTrigger>
                    <SelectPanel placement="bottom" />
                </Select>
            </AppliedFilter>

            <Modal width={500} visible={showCustomModal} onClose={() => setShowCustomModal(false)}>
                <ModalHeader>
                    <Text size="l">{tr('Custom period')}</Text>
                </ModalHeader>
                <ModalContent>
                    <CustomPeriodForm close={() => setShowCustomModal(false)} />
                </ModalContent>
            </Modal>
        </>
    );
};
