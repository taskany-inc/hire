import { useState } from 'react';
import styled from 'styled-components';
import { Button, ModalContent, ModalHeader, ModalPreview, Text } from '@taskany/bricks';
import { gapS, gray10 } from '@taskany/colors';

import { VacancyFilterContextProvider } from '../../contexts/vacancyFilterContext';
import { VacancyFilterBar } from '../VacancyFilterBar/VacancyFilterBar';
import { VacancyList } from '../VacancyList/VacancyList';
import { Vacancy } from '../../modules/crewTypes';
import { VacancyInfoById } from '../VacancyInfo/VacancyInfo';

import { tr } from './AddVacancyToInterview.i18n';

interface AddVacancyToInterviewProps {
    vacancyId?: string | null;
    onSelect: (vacancy?: Vacancy) => void;
}

const StyledButton = styled(Button)`
    margin-top: ${gapS};
`;

const AddVacancyToInterviewInner = ({ vacancyId, onSelect }: AddVacancyToInterviewProps) => {
    const [open, setOpen] = useState(false);

    const selectAndClose = (vacancy: Vacancy) => {
        onSelect(vacancy);
        setOpen(false);
    };

    if (vacancyId) {
        return (
            <>
                <VacancyInfoById vacancyId={vacancyId} />
                <StyledButton text={tr('Remove vacancy')} onClick={() => onSelect(undefined)} />
            </>
        );
    }

    return (
        <>
            <Button text={tr('Add vacancy')} onClick={() => setOpen(true)} />
            <ModalPreview visible={open} onClose={() => setOpen(false)}>
                <ModalHeader>
                    <Text weight="bold" color={gray10}>
                        {tr('Add vacancy')}
                    </Text>
                    <VacancyFilterBar />
                </ModalHeader>

                <ModalContent>
                    <VacancyList onSelect={selectAndClose} />
                </ModalContent>
            </ModalPreview>
        </>
    );
};

export const AddVacancyToInterview = (props: AddVacancyToInterviewProps) => {
    return (
        <VacancyFilterContextProvider>
            <AddVacancyToInterviewInner {...props} />
        </VacancyFilterContextProvider>
    );
};
