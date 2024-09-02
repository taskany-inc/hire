import { useState } from 'react';
import { ModalContent, ModalHeader, ModalPreview, Text } from '@taskany/bricks';
import { gray10 } from '@taskany/colors';

import { VacancyFilterBar } from '../VacancyFilterBar/VacancyFilterBar';
import { VacancyList } from '../VacancyList/VacancyList';
import { AddInlineTrigger } from '../AddInlineTrigger/AddInlineTrigger';
import { Vacancy } from '../../modules/crewTypes';
import { VacancyInfoById } from '../VacancyInfo/VacancyInfo';

import { tr } from './AddVacancyToInterview.i18n';

interface AddVacancyToInterviewProps {
    vacancyId?: string | null;
    onSelect: (vacancy?: Vacancy) => void;
}

export const AddVacancyToInterview = ({ vacancyId, onSelect }: AddVacancyToInterviewProps) => {
    const [open, setOpen] = useState(false);

    const selectAndClose = (vacancy: Vacancy) => {
        onSelect(vacancy);
        setOpen(false);
    };

    if (vacancyId) {
        return <VacancyInfoById vacancyId={vacancyId} onClick={() => onSelect(undefined)} />;
    }

    return (
        <>
            <AddInlineTrigger text={tr('Add vacancy')} onClick={() => setOpen(true)} centered={false} />
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
