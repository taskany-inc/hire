import { AppliedFilter, Text, Select, SelectPanel, SelectTrigger, TagCleanButton } from '@taskany/bricks/harmony';
import { nullable } from '@taskany/bricks';

import { AnalyticsPeriod } from '../../hooks/useAnalyticsFilterUrlParams';

import { tr } from './AppliedAnalyticsPeriodFilter.i18n';

interface AppliedAnalyticsPeriodFilterProps {
    period?: AnalyticsPeriod;
    setPeriod: (period: AnalyticsPeriod) => void;
    onClearFilter: VoidFunction;
}

export const AppliedAnalyticsPeriodFilter = ({
    period,
    setPeriod,
    onClearFilter,
}: AppliedAnalyticsPeriodFilterProps) => {
    const periodMap: Record<AnalyticsPeriod, string> = {
        year: tr('Year'),
        quarter: tr('Quarter'),
        month: tr('Month'),
        week: tr('Week'),
    };
    const items = Object.entries(periodMap).map(([k, v]) => ({ id: k, name: v }));
    const value = period ? [{ id: period, name: periodMap[period] }] : [];

    return (
        <AppliedFilter label={tr('Period')} action={<TagCleanButton size="s" onClick={onClearFilter} />}>
            <Select
                arrow
                items={items}
                mode="single"
                selectable
                renderItem={({ item }) => (
                    <Text size="s" weight="bold" as="span">
                        {item.name}
                    </Text>
                )}
                onChange={([item]) => {
                    setPeriod(item.id as AnalyticsPeriod);
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
    );
};
