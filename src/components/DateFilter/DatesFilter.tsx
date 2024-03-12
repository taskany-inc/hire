import { FilterTabLabel, Tab, nullable, Text } from '@taskany/bricks';
import { danger0 } from '@taskany/colors';

import { DatePicker } from '../DatePicker';
import { formatDateToLocaleString } from '../../utils/date';

import { tr } from './DateFilter.i18n';

interface DatesFilterProps {
    tabName: string;
    label: string;
    startDate?: Date;
    endDate?: Date;
    setStartDate: (date: Date) => void;
    setEndDate: (date: Date) => void;
}

export const DatesFilter = ({ tabName, label, startDate, endDate, setEndDate, setStartDate }: DatesFilterProps) => {
    const selected =
        endDate && startDate ? [`${formatDateToLocaleString(startDate)} - ${formatDateToLocaleString(endDate)}`] : [];

    return (
        <Tab name={tabName} label={<FilterTabLabel text={label} selected={selected} />}>
            <DatePicker value={startDate} onChange={setStartDate} label="Start Date" />
            <DatePicker value={endDate} onChange={setEndDate} label="End Date" />
            {nullable(startDate && endDate && startDate > endDate, () => (
                <Text size="xs" color={danger0}>
                    {tr('End date is earlier than start date')}
                </Text>
            ))}
        </Tab>
    );
};
