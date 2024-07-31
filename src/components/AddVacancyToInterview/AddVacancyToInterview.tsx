import { useState } from 'react';
import { ModalContent, ModalHeader, ModalPreview, Text } from '@taskany/bricks';
import { gray10 } from '@taskany/colors';
import { Button } from '@taskany/bricks/harmony';

import { VacancyFilterBar } from '../VacancyFilterBar/VacancyFilterBar';
import { VacancyList } from '../VacancyList/VacancyList';
import { Vacancy } from '../../modules/crewTypes';
import { VacancyInfoById } from '../VacancyInfo/VacancyInfo';

import { tr } from './AddVacancyToInterview.i18n';
import s from './AddVacancyToInterview.module.css';

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
        return (
            <>
                <VacancyInfoById vacancyId={vacancyId} />
                <Button
                    className={s.AddVacancyToInterviewRemoveButton}
                    text={tr('Remove vacancy')}
                    onClick={() => onSelect(undefined)}
                />
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
