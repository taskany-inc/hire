import { SubmitHandler, useForm } from 'react-hook-form';
import { useCallback } from 'react';
import { nullable } from '@taskany/bricks';
import {
    Button,
    FormControl,
    FormControlLabel,
    Modal,
    ModalContent,
    ModalCross,
    ModalHeader,
} from '@taskany/bricks/harmony';

import { AddInlineTrigger } from '../AddInlineTrigger/AddInlineTrigger';
import { InterviewWithRelations, UpdateInterview } from '../../modules/interviewTypes';
import { useInterviewUpdateMutation } from '../../modules/interviewHooks';
import { Option } from '../../utils/types';
import { useProductFinalSectionDropdownOptions } from '../../modules/candidateSelectedSectionHooks';
import { CodeEditorField } from '../CodeEditorField/CodeEditorField';
import { CandidateNameSubtitle } from '../CandidateNameSubtitle/CandidateNameSubtitle';
import { Select } from '../Select';
import { FormActions } from '../FormActions/FormActions';
import { useHireStreams } from '../../modules/hireStreamsHooks';

import { tr } from './CandidateInterviewUpdatePopup.i18n';
import s from './CandidateInterviewUpdatePopup.module.css';

type InterviewUpdateFormData = Omit<UpdateInterview, 'candidateId' | 'candidateSelectedSectionId' | 'hireStreamId'> & {
    candidate: Option;
    candidateSelectedSectionId: number | -1;
    hireStreamId: number | -1;
};

interface CandidateInterviewUpdatePopupProps {
    visible: boolean;
    onClose: VoidFunction;
    interview: InterviewWithRelations;
}

export function CandidateInterviewUpdatePopup({ visible, onClose, interview }: CandidateInterviewUpdatePopupProps) {
    const interviewUpdateMutation = useInterviewUpdateMutation();

    const { candidate } = interview;

    const updateInterview: SubmitHandler<InterviewUpdateFormData> = useCallback(
        async ({ description, candidateSelectedSectionId, hireStreamId }) => {
            await interviewUpdateMutation.mutateAsync({
                data: {
                    interviewId: interview.id,
                    description,
                    candidateSelectedSectionId: candidateSelectedSectionId < 0 ? null : candidateSelectedSectionId,
                    hireStreamId,
                },
            });

            onClose();
        },
        [interview.id, interviewUpdateMutation, onClose],
    );

    const {
        control,
        handleSubmit,
        watch,
        setValue,
        formState: { isSubmitting },
    } = useForm<InterviewUpdateFormData>({
        defaultValues: {
            description: interview.description ?? '',
            candidateSelectedSectionId: interview.candidateSelectedSection?.id ?? -1,
            hireStreamId: interview.hireStreamId ?? undefined,
        },
    });

    const hireStreamsQuery = useHireStreams();
    const hireStreams = hireStreamsQuery.data ?? [];

    const productFinalSectionOptions = useProductFinalSectionDropdownOptions(interview.sections);

    const onHireStreamIdChange = (hireStreamId: number) => setValue('hireStreamId', hireStreamId);
    const onProductFinalSectionChange = (sectionId: number) => setValue('candidateSelectedSectionId', sectionId);

    return (
        <Modal onClose={onClose} visible={visible}>
            <ModalHeader>
                <ModalCross onClick={onClose} />
                {tr('Edit interview')}
            </ModalHeader>
            <ModalContent>
                <form onSubmit={handleSubmit(updateInterview)} className={s.CandidateInterviewUpdateForm}>
                    <CandidateNameSubtitle name={candidate.name} id={candidate.id} />

                    <FormControl>
                        <FormControlLabel className={s.CandidateInterviewUpdateFormLabel}>
                            {tr('Hire stream')}
                        </FormControlLabel>
                        <Select
                            placement="bottom-start"
                            selectPanelClassName={s.CandidateInterviewUpdateFormSelectDropdown}
                            items={hireStreams.map((stream) => ({ text: stream.name, id: String(stream.id) }))}
                            onChange={(id) => onHireStreamIdChange(Number(id))}
                            renderTrigger={({ ref, onClick }) =>
                                nullable(
                                    hireStreams?.find(({ id }) => Number(id) === watch('hireStreamId'))?.name,
                                    (title) => <Button onClick={onClick} ref={ref} text={title} />,
                                    <AddInlineTrigger onClick={onClick} ref={ref} text={tr('Choose hire stream')} />,
                                )
                            }
                        />
                    </FormControl>

                    <FormControl>
                        <FormControlLabel className={s.CandidateInterviewUpdateFormLabel}>
                            {tr("Candidate's Chosen Product Final")}
                        </FormControlLabel>
                        <Select
                            placement="bottom-start"
                            selectPanelClassName={s.CandidateInterviewUpdateFormSelectDropdown}
                            items={productFinalSectionOptions.map((option) => ({
                                ...option,
                                id: String(option.id),
                            }))}
                            onChange={(id) => onProductFinalSectionChange(Number(id))}
                            renderTrigger={({ ref, onClick }) => (
                                <Button
                                    onClick={onClick}
                                    ref={ref}
                                    text={
                                        productFinalSectionOptions.find(
                                            ({ id }) => Number(id) === watch('candidateSelectedSectionId'),
                                        )?.text
                                    }
                                />
                            )}
                        />
                    </FormControl>

                    <CodeEditorField
                        disableAttaches
                        name="description"
                        control={control}
                        placeholder={tr('Think carefully and write a couple of notes about this interview.')}
                        height={130}
                    />

                    <FormActions>
                        <Button
                            disabled={isSubmitting}
                            size="s"
                            view="primary"
                            type="submit"
                            text={tr('Save interview')}
                        />
                    </FormActions>
                </form>
            </ModalContent>
        </Modal>
    );
}
