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
import { AiAssistantUpdateData, aiAssistantUpdateDataSchema, AiAssistantItem } from '../../modules/aiAssistantTypes';

import { tr } from './EditAiAssistant.i18n';
import s from './EditAiAssistant.module.css';

interface SearchAndCreateProps {
    query: string;
    onQueryChange: (value: string) => void;
    items: AiAssistantItem[];
    onSelect: (item: AiAssistantItem) => void;
    onCreate: () => void;
    placeholder: string;
    loading: boolean;
}

const SearchAndCreate = ({
    query,
    onQueryChange,
    items,
    onSelect,
    onCreate,
    placeholder,
    loading,
}: SearchAndCreateProps) => {
    const [isSelectOpen, setIsSelectOpen] = useState(false);

    const handleItemSelect = useCallback(
        (selected: AiAssistantItem[]) => {
            if (selected.length > 0) {
                onSelect(selected[0]);
                setIsSelectOpen(false);
            }
        },
        [onSelect],
    );

    return (
        <Select
            isOpen={isSelectOpen}
            onClose={() => setIsSelectOpen(false)}
            value={[]}
            items={items}
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
                            onChange={(e) => onQueryChange(e.target.value)}
                            onClick={onClick}
                            ref={ref}
                            view="default"
                            brick="right"
                        />
                        <Button
                            view="primary"
                            text={tr('Create')}
                            brick="left"
                            disabled={!query || items.length > 0 || loading}
                            onClick={onCreate}
                        />
                    </div>
                )}
            />
            <SelectPanel placement="bottom-start" />
        </Select>
    );
};

interface TopicSearchAndCreateProps {
    topics: AiAssistantItem[];
    onTopicsChange: (topics: AiAssistantItem[]) => void;
}

const TopicSearchAndCreate = ({ topics, onTopicsChange }: TopicSearchAndCreateProps) => {
    const [query, setQuery] = useState('');

    const { data: suggestions = [], refetch: refetchSuggestions } = trpc.aiAssistant.topicSuggestion.useQuery({
        query,
        exclude: topics.map((t) => t.id),
    });

    useEffect(() => {
        refetchSuggestions();
    }, [topics]);

    const handleSelect = useCallback(
        (item: AiAssistantItem) => {
            onTopicsChange([...topics, item]);
            setQuery('');
        },
        [topics, onTopicsChange],
    );

    const createTopicMutation = trpc.aiAssistant.createTopic.useMutation({
        onSuccess: (newTopic: AiAssistantItem) => {
            handleSelect(newTopic);
        },
    });

    const handleCreate = useCallback(() => {
        if (!query) return;
        createTopicMutation.mutate({ value: query });
    }, [query, createTopicMutation]);

    return (
        <SearchAndCreate
            query={query}
            onQueryChange={setQuery}
            items={suggestions}
            onSelect={handleSelect}
            onCreate={handleCreate}
            placeholder={tr('Search or add topic')}
            loading={createTopicMutation.isLoading}
        />
    );
};

interface FormatSearchAndCreateProps {
    formats: AiAssistantItem[];
    onFormatsChange: (formats: AiAssistantItem[]) => void;
}

const FormatSearchAndCreate = ({ formats, onFormatsChange }: FormatSearchAndCreateProps) => {
    const [query, setQuery] = useState('');

    const { data: suggestions = [], refetch: refetchSuggestions } = trpc.aiAssistant.formatSuggestion.useQuery({
        query,
        exclude: formats.map((f) => f.id),
    });

    useEffect(() => {
        refetchSuggestions();
    }, [formats]);

    const handleSelect = useCallback(
        (item: AiAssistantItem) => {
            onFormatsChange([...formats, item]);
            setQuery('');
        },
        [formats, onFormatsChange],
    );

    const createFormatMutation = trpc.aiAssistant.createFormat.useMutation({
        onSuccess: (newFormat: AiAssistantItem) => {
            handleSelect(newFormat);
        },
    });

    const handleCreate = useCallback(() => {
        if (!query) return;
        createFormatMutation.mutate({ value: query });
    }, [query, createFormatMutation]);

    return (
        <SearchAndCreate
            query={query}
            onQueryChange={setQuery}
            items={suggestions}
            onSelect={handleSelect}
            onCreate={handleCreate}
            placeholder={tr('Search or add format')}
            loading={createFormatMutation.isLoading}
        />
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
            topics: currentAssistant?.topics.map((t) => ({ id: t.id, value: t.value })) || [],
            formats: currentAssistant?.formats.map((f) => ({ id: f.id, value: f.value })) || [],
        }),
        [currentAssistant],
    );

    const {
        handleSubmit,
        register,
        setValue,
        watch,
        reset,
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

    const handleTopicsChange = useCallback(
        (newTopics: AiAssistantItem[]) => {
            setValue('topics', newTopics, { shouldDirty: true });
        },
        [setValue],
    );

    const handleFormatsChange = useCallback(
        (newFormats: AiAssistantItem[]) => {
            setValue('formats', newFormats, { shouldDirty: true });
        },
        [setValue],
    );

    const removeTopic = useCallback(
        (id: string) => {
            setValue(
                'topics',
                watch('topics').filter((t) => t.id !== id),
                { shouldDirty: true },
            );
        },
        [setValue, watch],
    );

    const removeFormat = useCallback(
        (id: string) => {
            setValue(
                'formats',
                watch('formats').filter((f) => f.id !== id),
                { shouldDirty: true },
            );
        },
        [setValue, watch],
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
                                {watch('topics').map((t) => (
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
                            <TopicSearchAndCreate topics={watch('topics')} onTopicsChange={handleTopicsChange} />
                            {nullable(errors.topics, (e) => (
                                <FormControlError error={{ message: e.message }} />
                            ))}
                        </FormControl>

                        <FormControl className={s.FormControl}>
                            <FormControlLabel>{tr('Formats')}</FormControlLabel>
                            <div className={s.BadgeContainer}>
                                {watch('formats').map((f) => (
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
                            <FormatSearchAndCreate formats={watch('formats')} onFormatsChange={handleFormatsChange} />
                            {nullable(errors.formats, (e) => (
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
