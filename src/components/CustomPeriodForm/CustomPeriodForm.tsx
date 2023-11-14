import { format } from 'date-fns';
import { useState } from 'react';
import styled from 'styled-components';
import { gapS } from '@taskany/colors';

import { useAnalyticsFilterContext } from '../../contexts/analyticsFilterContext';
import { DatePicker } from '../DatePicker';
import { FormContainer } from '../FormContainer';

import { tr } from './CustomPeriodForm.i18n';

type CustomPeriodFormProps = {
    close: () => void;
};

const StyledDateContainer = styled.div`
    display: flex;
    gap: ${gapS};
`;

export const CustomPeriodForm = ({ close }: CustomPeriodFormProps) => {
    const { startDate, endDate, setStartDate, setEndDate, setPeriodTitle } = useAnalyticsFilterContext();

    const [newStartDate, setNewStartDate] = useState<Date>(startDate);
    const [newEndDate, setNewEndDate] = useState<Date>(endDate);

    const onSubmitButton = () => {
        setStartDate(newStartDate);
        setEndDate(newEndDate);
        setPeriodTitle(`${format(newStartDate, 'd.M.YYY')} - ${format(newEndDate, 'd.M.YYY')}`);
        close();
    };

    const submitButtonDisabled = newStartDate > newEndDate;

    const submitButtonText = submitButtonDisabled ? tr('Start date later than end date') : tr('Set period');

    return (
        <FormContainer
            submitButtonDisabled={submitButtonDisabled}
            onSubmitButton={onSubmitButton}
            submitButtonText={submitButtonText}
            notToShowHint
        >
            <StyledDateContainer>
                <DatePicker value={newStartDate} onChange={setNewStartDate} label={tr('Start of period')} />
                <DatePicker value={newEndDate} onChange={setNewEndDate} label={tr('End of period')} />
            </StyledDateContainer>
        </FormContainer>
    );
};
