import {
    AppliedFilter,
    Checkbox,
    Counter,
    Input,
    Select,
    SelectPanel,
    SelectTrigger,
    TagCleanButton,
    Text,
} from '@taskany/bricks/harmony';
import React, { FC, useState } from 'react';
import { nullable } from '@taskany/bricks';

import { trpc } from '../../trpc/trpcClient';
import { suggestionsTake, useQueryOptions } from '../../utils/suggestions';

import { tr } from './AppliedProblemTagsFilter.i18n';

interface AppliedProblemTagsFilterProps {
    onCleanFilter: () => void;
    selectedTags: number[] | undefined;
    onChange: (tags: { id: string }[]) => void;
    onClose: () => void;
}

export const AppliedProblemTagsFilter: FC<AppliedProblemTagsFilterProps> = ({
    onChange,
    onCleanFilter,
    selectedTags,
    onClose,
}) => {
    const [tagQuery, setTagQuery] = useState('');
    const { data: tags = [] } = trpc.tags.suggestions.useQuery(
        { query: tagQuery, take: suggestionsTake, include: selectedTags },
        useQueryOptions,
    );

    const tagsValue = tags
        .filter((tag) => selectedTags?.includes(tag.id))
        .map((tag) => ({
            ...tag,
            id: tag.id.toString(),
        }));

    return (
        <AppliedFilter label={tr('Tags')} action={<TagCleanButton size="s" onClick={onCleanFilter} />}>
            <Select
                arrow
                value={tagsValue}
                items={tags.map((tag) => ({
                    ...tag,
                    id: String(tag.id),
                }))}
                onClose={onClose}
                onChange={onChange}
                mode="multiple"
                renderItem={({ item }) => <Checkbox label={item.name} checked={selectedTags?.includes(+item.id)} />}
            >
                <SelectTrigger>
                    {nullable(
                        selectedTags && selectedTags?.length > 1,
                        () => (
                            <Counter count={selectedTags!.length} />
                        ),
                        nullable(tagsValue[0], (tag) => <Text ellipsis>{tag.name}</Text>),
                    )}
                </SelectTrigger>
                <SelectPanel placement="bottom">
                    <Input placeholder={tr('Search')} onChange={(e) => setTagQuery(e.target.value)} />
                </SelectPanel>
            </Select>
        </AppliedFilter>
    );
};
