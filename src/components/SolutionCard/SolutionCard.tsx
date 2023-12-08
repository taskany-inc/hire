import { CSSProperties, FC, useCallback, useRef, useState } from 'react';
import { SolutionResult } from '@prisma/client';
import { Resolver, ResolverError, useForm } from 'react-hook-form';
import styled from 'styled-components';
import { colorPrimary, gray6 } from '@taskany/colors';
import { Text, Button, Popup } from '@taskany/bricks';
import { IconArrowUpSmallOutline, IconArrowDownSmallOutline } from '@taskany/icons';

import { useSolutionRemoveMutation, useSolutionUpdateMutation } from '../../modules/solutionHooks';
import { UpdateSolution, SolutionWithRelations } from '../../modules/solutionTypes';
import { problemDifficultyLabels, solutionResultEmoji, solutionResultText } from '../../utils/dictionaries';
import { pageHrefs } from '../../utils/paths';
import { validationRules } from '../../utils/validationRules';
import { LocalStorageManager, useSectionSolutionAnswerPersisted } from '../../utils/localStorageManager';
import { trpc } from '../../trpc/trpcClient';
import { MarkdownRenderer } from '../MarkdownRenderer/MarkdownRenderer';
import { LoadingContainer } from '../LoadingContainer';
import { Stack } from '../Stack';
import { Card } from '../Card';
import { CardHeader } from '../CardHeader';
import { CardContent } from '../CardContent';
import { CodeEditorField } from '../CodeEditorField/CodeEditorField';
import { SwitchSolutionsOrderButton } from '../SwitchSolutionOrderButton';

import { tr } from './SolutionCard.i18n';

type SolutionCardProps = {
    solution: SolutionWithRelations;
    interviewId: number;
    isEditable: boolean;
    goUp?: () => Promise<void>;
    goDown?: () => Promise<void>;
    isSwitchOrderDisabled: boolean;
};

type ResultButtonProps = {
    result: SolutionResult;
    onClick: () => void;
    style?: CSSProperties;
};

const StyledHeaderWrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
`;

const StyledProblemSolution = styled(Text)`
    display: inline-flex;
    align-items: center;
    cursor: pointer;
    margin-top: 12px;
    gap: 5px;
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
        <Card>
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
                <MarkdownRenderer value={problem.description} style={{ maxWidth: 900 }} />

                <StyledProblemSolution size="s" as="div" onClick={() => setIsExpanded((v) => !v)}>
                    {tr('Possible Solution')}
                    {isExpanded ? <IconArrowUpSmallOutline size="s" /> : <IconArrowDownSmallOutline size="s" />}
                </StyledProblemSolution>

                {isExpanded && <MarkdownRenderer value={problem.solution} />}

                <LoadingContainer isSpinnerVisible={isSpinnerVisible}>
                    <Text size="l" style={{ marginTop: 20, marginBottom: 12 }} forwardRef={solutionRef}>
                        {tr("Candidate's solution")}
                    </Text>

                    {solution.answer && !editOpen ? (
                        <MarkdownRenderer value={solution.answer} />
                    ) : (
                        <form id={formId} onSubmit={handleSubmit(onSubmit)}>
                            <CodeEditorField
                                width="100%"
                                disableAttaches
                                name="answer"
                                control={control}
                                placeholder={tr('Enter solution')}
                                height={300}
                                options={validationRules.nonEmptyString}
                            />

                            <Stack direction="row" style={{ marginTop: 12, width: 'max-content' }}>
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
                                {errors.result && (
                                    <Text as="p" size="s" color="error" style={{ marginTop: 3 }}>
                                        {errors.result.message}
                                    </Text>
                                )}
                            </Stack>
                        </form>
                    )}
                    {!editOpen && solution.answer && (
                        <Text size="l" style={{ marginTop: 12 }}>
                            <strong>
                                {tr('Result:')} {solutionResultEmoji[solution.result]}{' '}
                                {solutionResultText[solution.result]}
                            </strong>
                        </Text>
                    )}

                    {isEditable && (
                        <Stack
                            direction="row"
                            gap={12}
                            style={{
                                marginTop: 12,
                                marginLeft: 'auto',
                                width: 'max-content',
                            }}
                        >
                            {!(solution.answer && !editOpen) && (
                                <Button view="primary" type="submit" form={formId} text={tr('Save')} />
                            )}
                            {solution.answer &&
                                (editOpen ? (
                                    <Button onClick={handleCancelClick} text={tr('Cancel')} />
                                ) : (
                                    <Button outline onClick={handleEditClick} view="primary" text={tr('Edit')} />
                                ))}

                            <Button view="danger" onClick={onRemoveSolution} text={tr('Delete problem')} />
                        </Stack>
                    )}
                </LoadingContainer>
            </CardContent>
        </Card>
    );
};
