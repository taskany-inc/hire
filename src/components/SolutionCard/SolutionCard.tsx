import { CSSProperties, FC, useCallback, useRef, useState } from 'react';
import { SolutionResult } from '@prisma/client';
import { Resolver, ResolverError, useForm } from 'react-hook-form';
import { colorPrimary, danger0, gray6 } from '@taskany/colors';
import { Text, Popup } from '@taskany/bricks';
import { Button } from '@taskany/bricks/harmony';
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
import { Card } from '../Card/Card';
import { CardHeader } from '../CardHeader/CardHeader';
import { CardContent } from '../CardContent';
import { CodeEditorField } from '../CodeEditorField/CodeEditorField';
import { SwitchSolutionsOrderButton } from '../SwitchSolutionOrderButton/SwitchSolutionOrderButton';

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
        <Card className={s.SolutionCard}>
            <div className={s.SolutionCardHeaderWrapper}>
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
            </div>
            <CardContent>
                <MarkdownRenderer value={problem.description} className={s.SolutionCardMarkdownRenderer} />

                <Text
                    size="s"
                    as="div"
                    onClick={() => setIsExpanded((v) => !v)}
                    className={s.SolutionCardProblemSolution}
                >
                    {tr('Possible Solution')}
                    {isExpanded ? <IconArrowUpSmallOutline size="s" /> : <IconArrowDownSmallOutline size="s" />}
                </Text>

                {isExpanded && <MarkdownRenderer value={problem.solution} className={s.SolutionCardMarkdownRenderer} />}

                <LoadingContainer isSpinnerVisible={isSpinnerVisible}>
                    <Text size="l" forwardRef={solutionRef} className={s.SolutionCardCandidatesSolutionText}>
                        {tr("Candidate's solution")}
                    </Text>

                    {solution.answer && !editOpen ? (
                        <MarkdownRenderer value={solution.answer} className={s.SolutionCardMarkdownRenderer} />
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

                            <Stack direction="row" className={s.SolutionCardResultButtonStack}>
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
                            </Stack>
                            {errors.result && (
                                <div className={s.SolutionCardErrorTextWrapper}>
                                    <Text as="p" size="s" color={danger0} className={s.SolutionCardResultErrorText}>
                                        {errors.result.message}
                                    </Text>
                                </div>
                            )}
                        </form>
                    )}
                    {!editOpen && solution.answer && (
                        <Text weight="bold" size="l" className={s.SolutionCardResultText}>
                            {tr('Result:')} {solutionResultEmoji[solution.result]} {solutionResultText[solution.result]}
                        </Text>
                    )}

                    {isEditable && (
                        <Stack direction="row" gap={12} className={s.SolutionCardButtonStack}>
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
                        </Stack>
                    )}
                </LoadingContainer>
            </CardContent>
        </Card>
    );
};
