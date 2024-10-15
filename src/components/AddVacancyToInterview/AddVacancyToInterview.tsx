import { useState } from 'react';
import { ModalContent, ModalHeader, ModalPreview, Text } from '@taskany/bricks/harmony';
import { gray10 } from '@taskany/colors';

import { VacancyFilterBar } from '../VacancyFilterBar/VacancyFilterBar';
import { VacancyList } from '../VacancyList/VacancyList';
import { AddInlineTrigger } from '../AddInlineTrigger/AddInlineTrigger';
import { Vacancy } from '../../modules/crewTypes';

import { tr } from './AddVacancyToInterview.i18n';

interface AddVacancyToInterviewProps {
    onSelect: (vacancy: Vacancy) => void;
}

export const AddVacancyToInterview = ({ onSelect }: AddVacancyToInterviewProps) => {
    const [open, setOpen] = useState(false);

    const selectAndClose = (vacancy: Vacancy) => {
        onSelect(vacancy);
        setOpen(false);
    };

    return (
        <>
            <AddInlineTrigger text={tr('Add vacancy')} onClick={() => setOpen(true)} centered={false} />
            <ModalPreview visible={open} onClose={() => setOpen(false)}>
                <ModalHeader>
                    <Text weight="semiBold" color={gray10}>
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
