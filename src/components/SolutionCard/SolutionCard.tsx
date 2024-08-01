import { CSSProperties, FC, useCallback, useRef, useState } from 'react';
import { SolutionResult } from '@prisma/client';
import { Resolver, ResolverError, useForm } from 'react-hook-form';
import styled from 'styled-components';
import { colorPrimary, danger0, gapL, gapM, gapS, gapXs, gray6 } from '@taskany/colors';
import { Text, Popup, nullable } from '@taskany/bricks';
import { Button } from '@taskany/bricks/harmony';
import { IconArrowUpSmallOutline, IconArrowDownSmallOutline } from '@taskany/icons';

import { useSolutionRemoveMutation, useSolutionUpdateMutation } from '../../modules/solutionHooks';
import { UpdateSolution, SolutionWithRelations } from '../../modules/solutionTypes';
import { problemDifficultyLabels, solutionResultEmoji, solutionResultText } from '../../utils/dictionaries';
import { pageHrefs } from '../../utils/paths';
import { validationRules } from '../../utils/validationRules';
import { LocalStorageManager, useSectionSolutionAnswerPersisted } from '../../utils/localStorageManager';
import { trpc } from '../../trpc/trpcClient';
import { LoadingContainer } from '../LoadingContainer';
import { Stack } from '../Stack';
import { Card } from '../Card';
import { CardHeader } from '../CardHeader/CardHeader';
import { CardContent } from '../CardContent';
import { CodeEditorField } from '../CodeEditorField/CodeEditorField';
import { SwitchSolutionsOrderButton } from '../SwitchSolutionOrderButton/SwitchSolutionOrderButton';
import Md from '../Md';

import { tr } from './SolutionCard.i18n';
import s from './SolutionCard.module.css';

interface SolutionCardProps {
    solution: SolutionWithRelations;
    interviewId: number;
    isEditable: boolean;
    goUp?: () => Promise<void>;
    goDown?: () => Promise<void>;
    isSwitchOrderDisabled: boolean;
}

interface ResultButtonProps {
    result: SolutionResult;
    onClick: () => void;
    style?: CSSProperties;
}

const StyledHeaderWrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
`;

const StyledProblemSolution = styled(Text)`
    display: inline-flex;
    align-items: center;
    cursor: pointer;
    margin-top: ${gapM};
    gap: ${gapXs};
`;

const StyledCard = styled(Card)`
    width: 900px;
`;

const StyledCandidatesSolutionText = styled(Text)`
    margin-top: ${gapL};
    margin-bottom: ${gapS};
`;

const StyledResultButtonStack = styled(Stack)`
    margin-top: ${gapM};
    width: max-content;
`;

const StyledErrorTextWrapper = styled.div`
    position: relative;
`;

const StyledResultErrorText = styled(Text)`
    margin-top: ${gapXs};
    position: absolute;
`;

const StyledResultText = styled(Text)`
    margin-top: ${gapM};
`;

const StyledButtonStack = styled(Stack)`
    margin-top: ${gapM};
    margin-left: auto;
    width: max-content;
`;

export const ResultButton = ({ result, onClick, style }: ResultButtonProps): JSX.Element => {
    const [popupVisible, setPopupVisibility] = useState(false);
    const popupRef = useRef<HTMLDivElement>(null);

    return (
        <>
            <div
                ref={popupRef}
                onMouseEnter={() => setPopupVisibility(true)}
                onMouseLeave={() => setPopupVisibility(false)}
            >
                <Button type="button" onClick={onClick} text={solutionResultEmoji[result]} style={style} />
            </div>
            <Popup tooltip placement="bottom-start" arrow={false} reference={popupRef} visible={popupVisible}>
                <Text size="xs">{solutionResultText[result]}</Text>
            </Popup>
        </>
    );
};

const solutionSubmitButtons: SolutionResult[] = [SolutionResult.GOOD, SolutionResult.OK, SolutionResult.BAD];

const resolver: Resolver<UpdateSolution> = (values) => {
    const error: ResolverError<UpdateSolution> = { values, errors: {} };
    let hasErrors = false;

    if (!values.answer) {
        hasErrors = true;
        error.errors.answer = { type: 'required', message: tr('Required field') };
    }

    if (!values.result || values.result === SolutionResult.UNKNOWN) {
        hasErrors = true;
        error.errors.result = {
            type: 'required',
            message: tr("Rate the candidate's solution"),
        };
    }

    if (hasErrors) {
        return error;
    }

    return { values, errors: {} };
};

export const SolutionCard: FC<SolutionCardProps> = ({
    goDown,
    goUp,
    solution,
    interviewId,
    isEditable,
    isSwitchOrderDisabled,
}) => {
    const solutionRef = useRef<HTMLHeadingElement>(null);

    const formId = `solution${solution.id}`;

    const { problem } = solution;

    const utils = trpc.useContext();
    const solutionUpdateMutation = useSolutionUpdateMutation();
    const solutionRemoveMutation = useSolutionRemoveMutation();

    const {
        handleSubmit,
        control,
        getValues,
        setValue,
        watch,
        trigger,
        formState: { errors },
    } = useForm<UpdateSolution>({
        resolver,
        defaultValues: {
            result: solution.result,
            answer: solution.answer ?? LocalStorageManager.getPersistedSolutionAnswerFeedback(solution.id) ?? '',
        },
    });
    const currentResult = watch('result');

    const [editOpen, setEditOpen] = useState(!solution.answer);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isSpinnerVisible, setSpinnerVisible] = useState(false);

    const { stopPersistingAnswer } = useSectionSolutionAnswerPersisted(
        solution,
        useCallback(() => getValues('answer'), [getValues]),
    );

    const onSubmit = ({ answer, result }: UpdateSolution) => {
        setSpinnerVisible(true);
        solutionUpdateMutation
            .mutateAsync({ solutionId: solution.id, answer, result })
            .then(stopPersistingAnswer)
            .finally(() => {
                setSpinnerVisible(false);
                setEditOpen(false);
            });
    };

    const handleResultClick = (result: SolutionResult) => () => {
        setValue('result', result);
        trigger('result');
    };

    const handleEditClick = () => {
        setEditOpen(true);
        solutionRef.current?.scrollIntoView;
    };

    const handleCancelClick = () => {
        setEditOpen(!editOpen);
    };

    const onRemoveSolution = async () => {
        await solutionRemoveMutation.mutateAsync({ solutionId: solution.id });
        utils.problems.getList.invalidate({ excludeInterviewId: interviewId });
    };

    return (
        <StyledCard>
            <StyledHeaderWrapper>
                <CardHeader
                    title={problem.name}
                    subTitle={`${tr('Difficulty:')} ${problemDifficultyLabels[problem.difficulty]}`}
                    link={pageHrefs.problem(problem.id)}
                />
                <div>
                    {goUp && (
                        <SwitchSolutionsOrderButton direction="up" onClick={goUp} disabled={isSwitchOrderDisabled} />
                    )}
                    {goDown && (
                        <SwitchSolutionsOrderButton
                            direction="down"
                            onClick={goDown}
                            disabled={isSwitchOrderDisabled}
                        />
                    )}
                </div>
            </StyledHeaderWrapper>
            <CardContent>
                {nullable(problem.description, (d) => (
                    <Md>{d}</Md>
                ))}

                <StyledProblemSolution size="s" as="div" onClick={() => setIsExpanded((v) => !v)}>
                    {tr('Possible Solution')}
                    {isExpanded ? <IconArrowUpSmallOutline size="s" /> : <IconArrowDownSmallOutline size="s" />}
                </StyledProblemSolution>

                {isExpanded && nullable(problem.solution, (s) => <Md>{s}</Md>)}

                <LoadingContainer isSpinnerVisible={isSpinnerVisible}>
                    <StyledCandidatesSolutionText size="l" forwardRef={solutionRef}>
                        {tr("Candidate's solution")}
                    </StyledCandidatesSolutionText>

                    {solution.answer && !editOpen ? (
                        nullable(solution.answer, (a) => <Md>{a}</Md>)
                    ) : (
                        <form id={formId} onSubmit={handleSubmit(onSubmit)}>
                            <CodeEditorField
                                passedError={errors.answer}
                                className={s.CodeEditorField}
                                disableAttaches
                                name="answer"
                                control={control}
                                placeholder={tr('Enter solution')}
                                height={300}
                                options={validationRules.nonEmptyString}
                            />

                            <StyledResultButtonStack direction="row">
                                {solutionSubmitButtons.map((result) => {
                                    const isCurrentResult = result && result === currentResult;

                                    return (
                                        <ResultButton
                                            result={result}
                                            onClick={handleResultClick(result)}
                                            style={{
                                                backgroundColor: isCurrentResult ? colorPrimary : `${gray6}`,
                                            }}
                                            key={solutionResultText[result]}
                                        />
                                    );
                                })}
                            </StyledResultButtonStack>
                            {errors.result && (
                                <StyledErrorTextWrapper>
                                    <StyledResultErrorText as="p" size="s" color={danger0}>
                                        {errors.result.message}
                                    </StyledResultErrorText>
                                </StyledErrorTextWrapper>
                            )}
                        </form>
                    )}
                    {!editOpen && solution.answer && (
                        <StyledResultText weight="bold" size="l">
                            {tr('Result:')} {solutionResultEmoji[solution.result]} {solutionResultText[solution.result]}
                        </StyledResultText>
                    )}

                    {isEditable && (
                        <StyledButtonStack direction="row" gap={12}>
                            {!(solution.answer && !editOpen) && (
                                <Button view="primary" type="submit" form={formId} text={tr('Save')} />
                            )}
                            {solution.answer &&
                                (editOpen ? (
                                    <Button onClick={handleCancelClick} text={tr('Cancel')} />
                                ) : (
                                    <Button onClick={handleEditClick} view="primary" text={tr('Edit')} />
                                ))}

                            <Button view="danger" onClick={onRemoveSolution} text={tr('Delete problem')} />
                        </StyledButtonStack>
                    )}
                </LoadingContainer>
            </CardContent>
        </StyledCard>
    );
};
