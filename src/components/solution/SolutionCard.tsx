import { CSSProperties, FC, useCallback, useRef, useState } from 'react';
import { SolutionResult } from '@prisma/client';
import { Resolver, ResolverError, useForm } from 'react-hook-form';
import styled from 'styled-components';
import dynamic from 'next/dynamic';
import { colorPrimary, gray6 } from '@taskany/colors';
import { Text, Button, ArrowUpSmallIcon, ArrowDownSmallIcon } from '@taskany/bricks';

import { useSolutionRemoveMutation, useSolutionUpdateMutation } from '../../hooks/solution-hooks';
import { MarkdownRenderer } from '../MarkdownRenderer';
import { UpdateSolution, SolutionWithRelations } from '../../backend/modules/solution/solution-types';
import { problemDifficultyLabels, solutionResultEmoji, solutionResultText } from '../../utils/dictionaries';
import { LoadingContainer } from '../LoadingContainer';
import { Stack } from '../layout/Stack';
import { Card } from '../card/Card';
import { CardHeader } from '../card/CardHeader';
import { CardContent } from '../card/CardContent';
import { pageHrefs } from '../../utils/paths';
import { CodeEditorField } from '../inputs/CodeEditorField';
import { validationRules } from '../../utils/validation-rules';
import { LocalStorageManager, useSectionSolutionAnswerPersisted } from '../../utils/local-storage-manager';
import { trpc } from '../../utils/trpc-front';

import { SwitchSolutionsOrderButton } from './SwitchSolutionOrderButton';
import { tr } from './solution.i18n';

const Popup = dynamic(() => import('@taskany/bricks/components/Popup'));

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

const StyledCard = styled(Card)`
    width: 80%;
`;

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

                <StyledProblemSolution size="l" as="div" onClick={() => setIsExpanded((v) => !v)}>
                    {tr('Possible Solution')}
                    {isExpanded ? <ArrowUpSmallIcon size="s" /> : <ArrowDownSmallIcon size="s" />}
                </StyledProblemSolution>

                {isExpanded && <MarkdownRenderer value={problem.solution} />}

                <LoadingContainer isSpinnerVisible={isSpinnerVisible}>
                    <Text size="l" style={{ marginTop: 20, marginBottom: 12 }} ref={solutionRef}>
                        {tr("Candidate's solution")}
                    </Text>

                    {solution.answer && !editOpen ? (
                        <MarkdownRenderer value={solution.answer} />
                    ) : (
                        <form id={formId} onSubmit={handleSubmit(onSubmit)}>
                            <CodeEditorField
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
