import { format } from 'date-fns';
import { useState } from 'react';
import styled from 'styled-components';

import { useAnalyticsFilterContext } from '../../contexts/analytics-filter-context';
import { DatePicker } from '../calendar/DateTimePickers/DatePicker';
import { FormContainer } from '../FormContainer/FormContainer';

type CustomPeriodFormProps = {
    close: () => void;
};

const StyledDateContainer = styled.div`
    display: flex;
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

    const submitButtonText = submitButtonDisabled ? 'Start date later than end date' : 'Set period';

    return (
        <FormContainer
            submitButtonDisabled={submitButtonDisabled}
            onSubmitButton={onSubmitButton}
            submitButtonText={submitButtonText}
            notToShowHint
        >
            <StyledDateContainer>
                <DatePicker value={newStartDate} onChange={setNewStartDate} label="Start of period" />
                <DatePicker value={newEndDate} onChange={setNewEndDate} label="End of period" />
            </StyledDateContainer>
        </FormContainer>
    );
};
