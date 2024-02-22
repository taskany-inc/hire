import { useState } from 'react';
import { Button, ModalContent, ModalHeader, ModalPreview, Text } from '@taskany/bricks';
import { gray10 } from '@taskany/colors';

import { VacancyFilterContextProvider } from '../../contexts/vacancyFilterContext';
import { VacancyFilterBar } from '../VacancyFilterBar/VacancyFilterBar';
import { VacancyList } from '../VacancyList/VacancyList';
import { Vacancy } from '../../modules/crewTypes';

import { tr } from './AddVacancyToInterview.i18n';

interface AddVacancyToInterviewProps {
    onSelect: (vacancy: Vacancy) => void;
}

const AddVacancyToInterviewInner = ({ onSelect }: AddVacancyToInterviewProps) => {
    const [open, setOpen] = useState(false);

    const selectAndClose = (vacancy: Vacancy) => {
        onSelect(vacancy);
        setOpen(false);
    };

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
