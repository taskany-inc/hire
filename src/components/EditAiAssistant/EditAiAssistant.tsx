import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Card,
    CardContent,
    FormControl,
    FormControlLabel,
    FormControlError,
    Text,
    Button,
    Textarea,
    Badge,
    Input,
    Spinner,
    Select,
    SelectTrigger,
    SelectPanel,
    Switch,
    SwitchControl,
} from '@taskany/bricks/harmony';
import { nullable } from '@taskany/bricks';
import { IconBinOutline, IconPlusCircleOutline, IconTickCircleOutline } from '@taskany/icons';

import { trpc } from '../../trpc/trpcClient';
import {
    AiAssistantUpdateData,
    aiAssistantUpdateDataSchema,
    AiAssistantOption,
    AiAssistantOptionType,
} from '../../modules/aiAssistantTypes';

import { tr } from './EditAiAssistant.i18n';
import s from './EditAiAssistant.module.css';

interface SearchAndCreateProps {
    placeholder: string;
    options: AiAssistantOption[];
    onOptionsChange: (options: AiAssistantOption[]) => void;
    type: AiAssistantOptionType;
}

const SearchAndCreate = ({ placeholder, options, onOptionsChange, type }: SearchAndCreateProps) => {
    const [query, setQuery] = useState('');
    const [isSelectOpen, setIsSelectOpen] = useState(false);

    const { data: suggestions = [], refetch: refetchSuggestions } = trpc.aiAssistant.optionSuggestion.useQuery({
        query,
        exclude: options.map((option) => option.id),
        type,
    });

    useEffect(() => {
        refetchSuggestions();
    }, [options, refetchSuggestions]);

    const handleSelect = useCallback(
        (item: AiAssistantOption) => {
            onOptionsChange([...options, item]);
            setQuery('');
        },
        [options, onOptionsChange],
    );

    const createOptionMutation = trpc.aiAssistant.createAssistantOption.useMutation({
        onSuccess: (newOption: AiAssistantOption) => {
            handleSelect(newOption);
        },
    });

    const handleCreate = useCallback(() => {
        if (!query) return;
        createOptionMutation.mutate({ value: query, type });
    }, [query, type, createOptionMutation]);

    const handleItemSelect = useCallback(
        (selected: AiAssistantOption[]) => {
            if (selected.length > 0) {
                handleSelect(selected[0]);
                setIsSelectOpen(false);
            }
        },
        [handleSelect],
    );

    return (
        <Select
            isOpen={isSelectOpen}
            onClose={() => setIsSelectOpen(false)}
            value={[]}
            items={suggestions}
            onChange={handleItemSelect}
            mode="single"
            selectable
            renderItem={({ item }) => (
                <Text size="s" weight="semiBold" as="span">
                    {item.value}
                </Text>
            )}
        >
            <SelectTrigger
                renderTrigger={({ onClick, ref }) => (
                    <div className={s.AddItemContainer}>
                        <Input
                            placeholder={placeholder}
                            value={query}
                            className={s.SearchInput}
                            onChange={(e) => setQuery(e.target.value)}
                            onClick={onClick}
                            ref={ref}
                            view="default"
                            brick="right"
                        />
                        <Button
                            view="primary"
                            text={tr('Create')}
                            brick="left"
                            disabled={!query || suggestions.length > 0 || createOptionMutation.isLoading}
                            onClick={handleCreate}
                        />
                    </div>
                )}
            />
            <SelectPanel placement="bottom-start" />
        </Select>
    );
};

export const EditAiAssistant = () => {
    const {
        data: allAssistants = [],
        isLoading: isLoadingAssistants,
        refetch: refetchAssistants,
    } = trpc.aiAssistant.getAllAiAssistants.useQuery();
    const { data: config, isLoading: isLoadingConfig, refetch: refetchConfig } = trpc.appConfig.get.useQuery();

    const [currentAssistantId, setCurrentAssistantId] = useState<string | undefined>(
        config?.aiAssistantId || undefined,
    );

    useEffect(() => {
        if (config?.aiAssistantId) {
            setCurrentAssistantId(config.aiAssistantId);
        }
    }, [config?.aiAssistantId]);

    const currentAssistant = allAssistants.find((a) => a.id === currentAssistantId);

    const isLoading = isLoadingAssistants || isLoadingConfig;
    const isCreating = !isLoading && !currentAssistant;

    const isActiveAssistant = config?.aiAssistantId === currentAssistantId;

    const handleAssistantChange = useCallback((_: React.SyntheticEvent<HTMLButtonElement>, assistantId: string) => {
        setCurrentAssistantId(assistantId);
    }, []);

    const handleCreateNew = useCallback(() => {
        setCurrentAssistantId(undefined);
    }, []);

    const defaultValues = useMemo(
        () => ({
            id: currentAssistant?.id,
            name: currentAssistant?.name || '',
            systemPrompt: currentAssistant?.systemPrompt || '',
            userPrompt: currentAssistant?.userPrompt || '',
            options: currentAssistant?.options || [],
        }),
        [currentAssistant],
    );

    const {
        handleSubmit,
        register,
        setValue,
        reset,
        watch,
        formState: { errors, isDirty, isSubmitting },
    } = useForm<AiAssistantUpdateData>({
        defaultValues,
        resolver: zodResolver(aiAssistantUpdateDataSchema),
    });

    useEffect(() => {
        if (!isLoading) {
            reset(defaultValues);
        }
    }, [isLoading, reset, defaultValues]);

    const formOptions = watch('options');

    const { topics, formats } = useMemo(() => {
        return {
            topics: formOptions.filter((option) => option.type === AiAssistantOptionType.Topic),
            formats: formOptions.filter((option) => option.type === AiAssistantOptionType.Format),
        };
    }, [formOptions]);

    const handleTopicsChange = useCallback(
        (newTopics: AiAssistantOption[]) => {
            setValue('options', [...newTopics, ...formats], { shouldDirty: true });
        },
        [setValue, formats],
    );

    const handleFormatsChange = useCallback(
        (newFormats: AiAssistantOption[]) => {
            setValue('options', [...topics, ...newFormats], { shouldDirty: true });
        },
        [setValue, topics],
    );

    const removeTopic = useCallback(
        (id: string) => {
            const updatedTopics = topics.filter((topic) => topic.id !== id);
            setValue('options', [...updatedTopics, ...formats], { shouldDirty: true });
        },
        [setValue, topics, formats],
    );

    const removeFormat = useCallback(
        (id: string) => {
            const updatedFormats = formats.filter((format) => format.id !== id);
            setValue('options', [...topics, ...updatedFormats], { shouldDirty: true });
        },
        [setValue, topics, formats],
    );

    const handleCancel = useCallback(() => {
        reset(defaultValues);
    }, [reset, defaultValues]);

    const updateAiAssistantMutation = trpc.aiAssistant.updateAiAssistant.useMutation({
        onSuccess: (aiAssistant) => {
            refetchConfig();
            refetchAssistants();
            setCurrentAssistantId(aiAssistant.id);
        },
    });

    const deleteAiAssistantMutation = trpc.aiAssistant.deleteAiAssistant.useMutation({
        onSuccess: () => {
            refetchConfig();
            refetchAssistants();
            setCurrentAssistantId(undefined);
        },
    });

    const setAiAssistantMutation = trpc.appConfig.setAiAssistant.useMutation({
        onSuccess: () => {
            refetchConfig();
            refetchAssistants();
        },
    });

    const onSubmit = handleSubmit(async (data: AiAssistantUpdateData) => {
        await updateAiAssistantMutation.mutateAsync(data);
    });

    const handleDelete = useCallback(() => {
        if (currentAssistantId) {
            deleteAiAssistantMutation.mutate(currentAssistantId);
        }
    }, [currentAssistantId, deleteAiAssistantMutation]);

    const handleToggleActive = useCallback(() => {
        if (isCreating) return;

        if (isActiveAssistant) {
            setAiAssistantMutation.mutate(null);
        } else if (currentAssistantId) {
            setAiAssistantMutation.mutate(currentAssistantId);
        }
    }, [isCreating, isActiveAssistant, currentAssistantId, setAiAssistantMutation]);

    if (isLoading) return <Spinner size="l" />;

    return (
        <>
            <div className={s.SwitchContainer}>
                <Switch value={currentAssistantId} onChange={handleAssistantChange} className={s.AssistantsSwitch}>
                    {allAssistants.map((assistant) => (
                        <SwitchControl
                            key={assistant.id}
                            value={assistant.id}
                            text={assistant.name}
                            iconLeft={
                                config?.aiAssistantId === assistant.id ? (
                                    <IconTickCircleOutline size="s" className={s.ActiveIcon} />
                                ) : null
                            }
                        />
                    ))}
                </Switch>
                <Button
                    view="primary"
                    size="s"
                    iconLeft={<IconPlusCircleOutline size="s" />}
                    text={tr('Create new')}
                    onClick={handleCreateNew}
                />
            </div>

            <form onSubmit={onSubmit}>
                <Card>
                    <CardContent>
                        <FormControl className={s.FormControl}>
                            <FormControlLabel>{tr('Name')}</FormControlLabel>
                            <div className={s.NameContainer}>
                                <Input {...register('name')} className={s.NameInput} brick="right" />
                                {!isCreating && (
                                    <Button
                                        type="button"
                                        view={isActiveAssistant ? 'danger' : 'primary'}
                                        text={isActiveAssistant ? tr('Disconnect') : tr('Connect')}
                                        brick="left"
                                        onClick={handleToggleActive}
                                        className={s.ConnectButton}
                                        disabled={isSubmitting}
                                    />
                                )}
                            </div>
                            {nullable(errors.name, (e) => (
                                <FormControlError error={{ message: e.message }} />
                            ))}
                        </FormControl>
                        <FormControl className={s.FormControl}>
                            <FormControlLabel>{tr('System prompt')}</FormControlLabel>
                            <Textarea rows={15} {...register('systemPrompt')} />
                            {nullable(errors.systemPrompt, (e) => (
                                <FormControlError error={{ message: e.message }} />
                            ))}
                        </FormControl>
                        <FormControl className={s.FormControl}>
                            <FormControlLabel>{tr('User prompt')}</FormControlLabel>
                            <Textarea
                                rows={5}
                                {...register('userPrompt')}
                                placeholder={tr('User prompt placeholder', {
                                    topic: '{topic}',
                                    format: '{format}',
                                })}
                            />
                            {nullable(errors.userPrompt, (e) => (
                                <FormControlError error={{ message: e.message }} />
                            ))}
                        </FormControl>

                        <FormControl className={s.FormControl}>
                            <FormControlLabel>{tr('Topics')}</FormControlLabel>
                            <div className={s.BadgeContainer}>
                                {topics.map((t) => (
                                    <Badge
                                        key={t.id}
                                        color="gray"
                                        text={t.value}
                                        iconRight={
                                            <IconBinOutline
                                                className={s.DeleteIcon}
                                                size="xs"
                                                onClick={() => removeTopic(t.id)}
                                            />
                                        }
                                    />
                                ))}
                            </div>
                            <SearchAndCreate
                                placeholder={tr('Search or add topic')}
                                options={topics}
                                onOptionsChange={handleTopicsChange}
                                type={AiAssistantOptionType.Topic}
                            />
                            {nullable(errors.options, (e) => (
                                <FormControlError error={{ message: e.message }} />
                            ))}
                        </FormControl>

                        <FormControl className={s.FormControl}>
                            <FormControlLabel>{tr('Formats')}</FormControlLabel>
                            <div className={s.BadgeContainer}>
                                {formats.map((f) => (
                                    <Badge
                                        key={f.id}
                                        color="gray"
                                        text={f.value}
                                        iconRight={
                                            <IconBinOutline
                                                className={s.DeleteIcon}
                                                size="xs"
                                                onClick={() => removeFormat(f.id)}
                                            />
                                        }
                                    />
                                ))}
                            </div>
                            <SearchAndCreate
                                placeholder={tr('Search or add format')}
                                options={formats}
                                onOptionsChange={handleFormatsChange}
                                type={AiAssistantOptionType.Format}
                            />
                            {nullable(errors.options, (e) => (
                                <FormControlError error={{ message: e.message }} />
                            ))}
                        </FormControl>

                        <div className={s.ButtonsContainer}>
                            <Button
                                type="submit"
                                view="primary"
                                disabled={isSubmitting || !isDirty}
                                text={isCreating ? tr('Create') : tr('Save')}
                            />
                            <Button
                                type="button"
                                view="default"
                                disabled={!isDirty}
                                text={tr('Cancel')}
                                onClick={handleCancel}
                            />
                            {!isCreating && (
                                <Button
                                    type="button"
                                    view="danger"
                                    text={tr('Delete')}
                                    onClick={handleDelete}
                                    className={s.DeleteButton}
                                />
                            )}
                        </div>
                    </CardContent>
                </Card>
            </form>
        </>
    );
};
