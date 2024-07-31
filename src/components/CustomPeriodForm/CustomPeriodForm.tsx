import { format } from 'date-fns';
import { useState } from 'react';
import styled from 'styled-components';
import { gapS } from '@taskany/colors';
import { Fieldset, Form, FormAction, FormActions, FormCard } from '@taskany/bricks';
import { Button } from '@taskany/bricks/harmony';

import { DatePicker } from '../DatePicker';
import { useAnalyticsFilterUrlParams } from '../../hooks/useAnalyticsFilterUrlParams';

import { tr } from './CustomPeriodForm.i18n';

const StyledFormCard = styled(FormCard)`
    width: 300px;
`;

interface CustomPeriodFormProps {
    close: () => void;
}

const StyledDateContainer = styled.div`
    display: flex;
    gap: ${gapS};
`;

export const CustomPeriodForm = ({ close }: CustomPeriodFormProps) => {
    const { startDate, endDate, setStartDate, setEndDate, setPeriodTitle } = useAnalyticsFilterUrlParams();

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
        <StyledFormCard>
            <Form onSubmit={onSubmitButton}>
                <Fieldset>
                    <StyledDateContainer>
                        <DatePicker value={newStartDate} onChange={setNewStartDate} label={tr('Start of period')} />
                        <DatePicker value={newEndDate} onChange={setNewEndDate} label={tr('End of period')} />
                    </StyledDateContainer>
                </Fieldset>
                <FormActions flat="top">
                    <FormAction left inline></FormAction>
                    <FormAction right inline>
                        <Button
                            size="m"
                            view="primary"
                            type="submit"
                            text={submitButtonText}
                            disabled={submitButtonDisabled}
                        />
                    </FormAction>
                </FormActions>
            </Form>
        </StyledFormCard>
    );
};
