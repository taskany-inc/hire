import { useState } from 'react';
import { Button } from '@taskany/bricks/harmony';

import { DatePicker } from '../DatePicker/DatePicker';
import { useAnalyticsFilterUrlParams } from '../../hooks/useAnalyticsFilterUrlParams';
import { FormActions } from '../FormActions/FormActions';

import { tr } from './CustomPeriodForm.i18n';
import s from './CustomPeriodForm.module.css';

interface CustomPeriodFormProps {
    close: () => void;
}

export const CustomPeriodForm = ({ close }: CustomPeriodFormProps) => {
    const {
        values: { startDate, endDate },
        setter,
    } = useAnalyticsFilterUrlParams();

    const [newStartDate, setNewStartDate] = useState<Date>(startDate);
    const [newEndDate, setNewEndDate] = useState<Date>(endDate);

    const onSubmitButton = () => {
        setter('period', undefined);
        setter('startDate', newStartDate.getTime());
        setter('endDate', newEndDate.getTime());
        close();
    };

    const submitButtonDisabled = newStartDate > newEndDate;

    const submitButtonText = submitButtonDisabled ? tr('Start date later than end date') : tr('Set period');

    return (
        <form onSubmit={onSubmitButton}>
            <div className={s.CustomPeriodFormDateContainer}>
                <DatePicker value={newStartDate} onChange={setNewStartDate} label={tr('Start of period')} />
                <DatePicker value={newEndDate} onChange={setNewEndDate} label={tr('End of period')} />
            </div>

            <FormActions>
                <Button size="s" view="primary" type="submit" text={submitButtonText} disabled={submitButtonDisabled} />
            </FormActions>
        </form>
    );
};
