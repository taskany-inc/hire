import { CSSProperties, FC, useCallback, useRef, useState } from 'react';
import { SolutionResult } from '@prisma/client';
import { Resolver, ResolverError, useForm } from 'react-hook-form';
import { danger0 } from '@taskany/colors';
import { nullable } from '@taskany/bricks';
import { Button, CardContent, Card, CardInfo, SwitchControl, Switch, Text, Popup } from '@taskany/bricks/harmony';
import { IconArrowUpSmallOutline, IconArrowDownSmallOutline } from '@taskany/icons';
import cn from 'classnames';

import { useSolutionRemoveMutation, useSolutionUpdateMutation } from '../../modules/solutionHooks';
import { UpdateSolution, SolutionWithRelations } from '../../modules/solutionTypes';
import { problemDifficultyLabels, solutionResultEmoji, solutionResultText } from '../../utils/dictionaries';
import { pageHrefs } from '../../utils/paths';
import { validationRules } from '../../utils/validationRules';
import { LocalStorageManager, useSectionSolutionAnswerPersisted } from '../../utils/localStorageManager';
import { trpc } from '../../trpc/trpcClient';
import { LoadingContainer } from '../LoadingContainer/LoadingContainer';
import { CardHeader } from '../CardHeader/CardHeader';
import { CodeEditorField } from '../CodeEditorField/CodeEditorField';
import { SwitchSolutionsOrderButton } from '../SwitchSolutionOrderButton/SwitchSolutionOrderButton';
import Md from '../Md';
import { Link } from '../Link';

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

export const ResultButton = ({ result, onClick }: ResultButtonProps): JSX.Element => {
    const [popupVisible, setPopupVisibility] = useState(false);
    const popupRef = useRef<HTMLDivElement>(null);

    return (
        <>
            <div
                ref={popupRef}
                onMouseEnter={() => setPopupVisibility(true)}
                onMouseLeave={() => setPopupVisibility(false)}
            >
                <SwitchControl
                    className=""
                    type="button"
                    value={solutionResultEmoji[result]}
                    text={solutionResultEmoji[result]}
                    onClick={onClick}
                    size="s"
                />
            </div>
            <Popup placement="top" arrow={false} reference={popupRef} visible={popupVisible}>
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
        trigger,
        watch,
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
        <Card className={s.Card}>
            <CardInfo className={cn(s.CardInfo)}>
                <CardHeader
                    title={<Link href={pageHrefs.problem(problem.id)}>{problem.name}</Link>}
                    subTitle={`${tr('Difficulty:')} ${problemDifficultyLabels[problem.difficulty]}`}
                />

                <div className={s.SwitchSolutionsOrderButton}>
                    {nullable(goUp, (up) => (
                        <SwitchSolutionsOrderButton direction="up" onClick={up} disabled={isSwitchOrderDisabled} />
                    ))}
                    {nullable(goDown, (down) => (
                        <SwitchSolutionsOrderButton direction="down" onClick={down} disabled={isSwitchOrderDisabled} />
                    ))}
                </div>
            </CardInfo>
            <CardContent className={s.CardContent}>
                {nullable(problem.description, (d) => (
                    <Md>{d}</Md>
                ))}

                <Text className={s.ProblemSolutionText} size="s" as="div" onClick={() => setIsExpanded((v) => !v)}>
                    {tr('Possible Solution')}
                    {isExpanded ? <IconArrowUpSmallOutline size="s" /> : <IconArrowDownSmallOutline size="s" />}
                </Text>

                {isExpanded && nullable(problem.solution, (s) => <Md>{s}</Md>)}

                <LoadingContainer isSpinnerVisible={isSpinnerVisible}>
                    <Text className={s.CandidatesSolutionText} size="l" ref={solutionRef}>
                        {tr("Candidate's solution")}
                    </Text>

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

                            <div className={s.Switch}>
                                <Switch value={currentResult ? solutionResultEmoji[currentResult] : undefined}>
                                    {solutionSubmitButtons.map((result) => {
                                        return (
                                            <ResultButton
                                                result={result}
                                                onClick={handleResultClick(result)}
                                                key={solutionResultText[result]}
                                            />
                                        );
                                    })}
                                </Switch>
                            </div>
                            {errors.result && (
                                <div className={s.ErrorTextWrapper}>
                                    <Text as="p" size="s" color={danger0}>
                                        {errors.result.message}
                                    </Text>
                                </div>
                            )}
                        </form>
                    )}
                    {!editOpen && solution.answer && (
                        <Text className={s.ResultText} weight="semiBold" size="l">
                            {tr('Result:')} {solutionResultEmoji[solution.result]} {solutionResultText[solution.result]}
                        </Text>
                    )}

                    {isEditable && (
                        <div className={s.ButtonStack}>
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
                        </div>
                    )}
                </LoadingContainer>
            </CardContent>
        </Card>
    );
};
