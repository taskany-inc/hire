import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
    Modal,
    ModalHeader,
    ModalContent,
} from '@taskany/bricks/harmony';
import { nullable } from '@taskany/bricks';
import {
    IconBinOutline,
    IconPlusCircleOutline,
    IconTickCircleOutline,
    IconEditOutline,
    IconXCircleOutline,
    IconRefreshOutline,
} from '@taskany/icons';

import { trpc } from '../../trpc/trpcClient';
import {
    AiAssistantUpdateData,
    aiAssistantUpdateDataSchema,
    AiAssistantOption,
    AiAssistantOptionType,
    CreateAssistantOptionTypeData,
    createAssistantOptionTypeSchema,
} from '../../modules/aiAssistantTypes';
import { FormActions } from '../FormActions/FormActions';
import { WarningModal } from '../WarningModal/WarningModal';
import { CommentView } from '../CommentView/CommentView';
import { CommentViewHeader } from '../CommentViewHeader/CommentViewHeader';

import { tr } from './EditAiAssistant.i18n';
import s from './EditAiAssistant.module.css';

interface SheepPreviewCardProps {
    user: {
        id: number;
        name: string | null;
        email: string;
    };
    text: string;
}

const SheepPreviewCard = ({ user, text }: SheepPreviewCardProps) => {
    return (
        <CommentView
            view="transparent"
            authors={[user]}
            text={text}
            header={<CommentViewHeader authors={[user]} date={new Date()} />}
        />
    );
};

interface SearchAndCreateProps {
    placeholder: string;
    options: AiAssistantOption[];
    onOptionsChange: (options: AiAssistantOption[]) => void;
    optionTypeId: string;
}

const SearchAndCreate = ({ placeholder, options, onOptionsChange, optionTypeId }: SearchAndCreateProps) => {
    const [query, setQuery] = useState('');
    const [isSelectOpen, setIsSelectOpen] = useState(false);

    const { data: suggestions = [], refetch: refetchSuggestions } = trpc.aiAssistant.optionSuggestion.useQuery({
        query,
        exclude: options.map((option) => option.id),
        optionTypeId,
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
        createOptionMutation.mutate({ value: query, optionTypeId });
    }, [query, optionTypeId, createOptionMutation]);

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

interface CreateOrEditOptionTypeModalProps {
    visible: boolean;
    onClose: () => void;
    optionType?: AiAssistantOptionType;
    onSuccess: () => void;
}

const CreateOrEditOptionTypeModal = ({ visible, onClose, optionType, onSuccess }: CreateOrEditOptionTypeModalProps) => {
    const isEditing = !!optionType;

    const createOptionTypeMutation = trpc.aiAssistant.createOptionType.useMutation({
        onSuccess: () => {
            onSuccess();
            onClose();
        },
    });

    const updateOptionTypeMutation = trpc.aiAssistant.updateOptionType.useMutation({
        onSuccess: () => {
            onSuccess();
            onClose();
        },
    });

    const {
        handleSubmit,
        watch,
        register,
        reset,
        formState: { isSubmitting, errors },
    } = useForm<CreateAssistantOptionTypeData>({
        resolver: zodResolver(createAssistantOptionTypeSchema),
        defaultValues: {
            name: optionType?.name || '',
            key: optionType?.key || '',
            description: optionType?.description || '',
        },
    });

    const key = watch('key');

    useEffect(() => {
        if (visible) {
            reset({
                name: optionType?.name || '',
                key: optionType?.key || '',
                description: optionType?.description || '',
            });
        }
    }, [visible, optionType, reset]);

    const onSubmit = handleSubmit(async (data) => {
        if (isEditing && optionType) {
            await updateOptionTypeMutation.mutateAsync({
                id: optionType.id,
                name: data.name,
                description: data.description,
            });
        } else {
            await createOptionTypeMutation.mutateAsync(data);
        }
    });

    return (
        <Modal visible={visible} onClose={onClose} width={600}>
            <form onSubmit={onSubmit}>
                <ModalHeader>
                    <Text size="l" weight="semiBold">
                        {isEditing ? tr('Edit option type') : tr('Create option type')}
                    </Text>
                </ModalHeader>
                <ModalContent className={s.ModalContent}>
                    <FormControl>
                        <FormControlLabel>{tr('Name')}</FormControlLabel>
                        <Input placeholder={tr('Option type name placeholder')} {...register('name')} />
                        {nullable(errors.name, (e) => (
                            <FormControlError error={e} />
                        ))}
                    </FormControl>

                    <FormControl>
                        <FormControlLabel>{tr('Key')}</FormControlLabel>
                        <Input
                            placeholder={tr('Option type key placeholder')}
                            {...register('key')}
                            disabled={isEditing}
                        />
                        {nullable(errors.key, (e) => (
                            <FormControlError error={e} />
                        ))}
                        <Text size="xs" color="secondary" className={s.KeyDescription}>
                            {tr('Key description', { key: `{${key || 'key'}}` })}
                        </Text>
                    </FormControl>

                    <FormControl>
                        <FormControlLabel>{tr('Description')}</FormControlLabel>
                        <Textarea
                            placeholder={tr('Option type description placeholder')}
                            {...register('description')}
                            rows={3}
                        />
                        {nullable(errors.description, (e) => (
                            <FormControlError error={e} />
                        ))}
                    </FormControl>

                    <FormActions>
                        <Button onClick={onClose} text={tr('Cancel')} />
                        <Button
                            type="submit"
                            view="primary"
                            disabled={isSubmitting}
                            text={isEditing ? tr('Save') : tr('Create')}
                        />
                    </FormActions>
                </ModalContent>
            </form>
        </Modal>
    );
};

export const EditAiAssistant = () => {
    const {
        data: allAssistants = [],
        isLoading: isLoadingAssistants,
        refetch: refetchAssistants,
    } = trpc.aiAssistant.getAllAiAssistants.useQuery(undefined, {
        staleTime: Infinity,
        cacheTime: Infinity,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
    });
    const { data: config, isLoading: isLoadingConfig, refetch: refetchConfig } = trpc.appConfig.get.useQuery();
    const {
        data: optionTypes = [],
        isLoading: isLoadingOptionTypes,
        refetch: refetchOptionTypes,
    } = trpc.aiAssistant.getAllOptionTypes.useQuery();
    const { data: sheepUser } = trpc.aiAssistant.getSheepUser.useQuery();

    const [currentAssistantId, setCurrentAssistantId] = useState<string | undefined>(
        config?.aiAssistantId || undefined,
    );

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingOptionType, setEditingOptionType] = useState<AiAssistantOptionType | null>(null);
    const [deletingOptionType, setDeletingOptionType] = useState<AiAssistantOptionType | null>(null);

    useEffect(() => {
        if (config?.aiAssistantId) {
            setCurrentAssistantId(config.aiAssistantId);
        }
    }, [config?.aiAssistantId]);

    const currentAssistant = allAssistants.find((a) => a.id === currentAssistantId);

    const isLoading = isLoadingAssistants || isLoadingConfig || isLoadingOptionTypes;
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

    const optionsByType = useMemo(() => {
        const grouped: Record<string, AiAssistantOption[]> = {};

        formOptions.forEach((option) => {
            if (option.optionType) {
                const typeKey = option.optionType.key;
                if (!grouped[typeKey]) {
                    grouped[typeKey] = [];
                }
                grouped[typeKey].push(option);
            }
        });

        return grouped;
    }, [formOptions]);

    const updateOptionsForType = useCallback(
        (typeKey: string, newOptions: AiAssistantOption[]) => {
            const otherOptions = formOptions.filter((option) => option.optionType?.key !== typeKey);
            setValue('options', [...otherOptions, ...newOptions], { shouldDirty: true });
        },
        [setValue, formOptions],
    );

    const removeOptionFromType = useCallback(
        (typeKey: string, optionId: string) => {
            const updatedOptions = formOptions.filter(
                (option) => !(option.optionType?.key === typeKey && option.id === optionId),
            );
            setValue('options', updatedOptions, { shouldDirty: true });
        },
        [setValue, formOptions],
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

    const deleteOptionTypeMutation = trpc.aiAssistant.deleteOptionType.useMutation({
        onSuccess: () => {
            refetchOptionTypes();
            setDeletingOptionType(null);
        },
    });

    const options = watch('options');
    const systemPrompt = watch('systemPrompt');
    const userPrompt = watch('userPrompt');

    const getAssistantAnswerMutation = trpc.aiAssistant.getAssistantAnswer.useMutation();

    const exampleResponse = React.useMemo(() => {
        if (!systemPrompt || !userPrompt) {
            return tr('Fill system and user prompts first');
        }
        if (getAssistantAnswerMutation.isLoading) {
            return tr('Loading');
        }
        if (getAssistantAnswerMutation.error) {
            return `Error: ${getAssistantAnswerMutation.error.message}`;
        }
        if (getAssistantAnswerMutation.data) {
            return getAssistantAnswerMutation.data;
        }
        return tr('Click Update to get assistant response');
    }, [
        getAssistantAnswerMutation.data,
        getAssistantAnswerMutation.error,
        getAssistantAnswerMutation.isLoading,
        systemPrompt,
        userPrompt,
    ]);

    const handleUpdateExample = useCallback(() => {
        if (!systemPrompt || !userPrompt) {
            return;
        }

        getAssistantAnswerMutation.mutate({
            systemPrompt,
            userPrompt,
            options,
        });
    }, [systemPrompt, userPrompt, options, getAssistantAnswerMutation]);

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
                            <Textarea rows={10} {...register('systemPrompt')} />
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

                        {optionTypes.map((optionType) => {
                            const options = optionsByType[optionType.key] || [];
                            return (
                                <Card
                                    key={optionType.key}
                                    className={s.OptionTypeCard}
                                    backgroundColor="var(--input-border)"
                                >
                                    <CardContent view="transparent">
                                        <FormControl className={s.FormControl}>
                                            <FormControlLabel className={s.OptionTypeLabel}>
                                                <Text size="ml" weight="semiBold">
                                                    {optionType.name}
                                                </Text>
                                                <Text size="xs" as="span" className={s.Description}>
                                                    {`{${optionType.key}}`}
                                                </Text>
                                                <div className={s.OptionControls}>
                                                    <Button
                                                        type="button"
                                                        size="s"
                                                        view="ghost"
                                                        iconLeft={<IconEditOutline size="xs" />}
                                                        onClick={() => setEditingOptionType(optionType)}
                                                    />
                                                    <Button
                                                        type="button"
                                                        size="s"
                                                        view="ghost"
                                                        iconLeft={<IconBinOutline className={s.DeleteIcon} size="xs" />}
                                                        onClick={() => setDeletingOptionType(optionType)}
                                                    />
                                                </div>
                                            </FormControlLabel>
                                            {nullable(optionType.description, (desc) => (
                                                <Text size="s" weight="thin" className={s.OptionTypeDescription}>
                                                    {desc}
                                                </Text>
                                            ))}
                                            <div className={s.BadgeContainer}>
                                                {options.map((option) => (
                                                    <Badge
                                                        key={option.id}
                                                        color="gray"
                                                        text={option.value}
                                                        iconRight={
                                                            <IconXCircleOutline
                                                                size="xs"
                                                                onClick={() =>
                                                                    removeOptionFromType(optionType.key, option.id)
                                                                }
                                                            />
                                                        }
                                                    />
                                                ))}
                                            </div>
                                            <SearchAndCreate
                                                placeholder={`Search or add ${optionType.name.toLowerCase()}`}
                                                options={options}
                                                onOptionsChange={(newOptions) =>
                                                    updateOptionsForType(optionType.key, newOptions)
                                                }
                                                optionTypeId={optionType.id}
                                            />
                                            {nullable(errors.options, (e) => (
                                                <FormControlError error={{ message: e.message }} />
                                            ))}
                                        </FormControl>
                                    </CardContent>
                                </Card>
                            );
                        })}

                        <div className={s.FormControl}>
                            <Button
                                type="button"
                                view="primary"
                                size="s"
                                iconLeft={<IconPlusCircleOutline size="s" />}
                                text={tr('Create setting')}
                                onClick={() => setIsCreateModalOpen(true)}
                            />
                        </div>

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

            {sheepUser && (
                <Card className={s.ExampleSection}>
                    <CardContent>
                        <FormControl>
                            <FormControlLabel>
                                <Text size="ml" weight="semiBold">
                                    {tr('Answer example')}
                                </Text>
                                <Button
                                    type="button"
                                    view="primary"
                                    size="xs"
                                    iconLeft={<IconRefreshOutline size="s" />}
                                    text={tr('Update')}
                                    className={s.UpdateButton}
                                    onClick={handleUpdateExample}
                                    disabled={!systemPrompt || !userPrompt || getAssistantAnswerMutation.isLoading}
                                />
                            </FormControlLabel>
                            <div className={s.ExampleComment}>
                                <div className={s.ExampleCommentPreview}>
                                    <SheepPreviewCard user={sheepUser} text={exampleResponse} />
                                </div>
                            </div>
                        </FormControl>
                    </CardContent>
                </Card>
            )}

            {nullable(isCreateModalOpen, () => (
                <CreateOrEditOptionTypeModal
                    visible
                    onClose={() => setIsCreateModalOpen(false)}
                    onSuccess={() => {
                        refetchOptionTypes();
                    }}
                />
            ))}

            {nullable(editingOptionType, (optionType) => (
                <CreateOrEditOptionTypeModal
                    visible
                    onClose={() => setEditingOptionType(null)}
                    optionType={optionType}
                    onSuccess={() => {
                        refetchOptionTypes();
                    }}
                />
            ))}

            {nullable(deletingOptionType, () => (
                <WarningModal
                    visible
                    warningText={
                        deletingOptionType ? (
                            <>
                                {tr('Delete option type confirmation', { name: deletingOptionType.name })}
                                <strong>{tr('Warning: All related options will be deleted')}</strong>
                            </>
                        ) : null
                    }
                    onCancel={() => setDeletingOptionType(null)}
                    onConfirm={async () => {
                        if (deletingOptionType) {
                            await deleteOptionTypeMutation.mutateAsync(deletingOptionType.id);
                        }
                    }}
                    view="danger"
                />
            ))}
        </>
    );
};
