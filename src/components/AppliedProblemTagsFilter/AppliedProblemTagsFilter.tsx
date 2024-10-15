import {
    AppliedFilter,
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
    onChange: (tags: { id: number }[]) => void;
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

    const tagsValue = tags.filter((tag) => selectedTags?.includes(tag.id));

    return (
        <AppliedFilter label={tr('Tags')} action={<TagCleanButton size="s" onClick={onCleanFilter} />}>
            <Select
                arrow
                value={tagsValue}
                items={tags}
                onClose={onClose}
                onChange={onChange}
                mode="multiple"
                selectable
                renderItem={({ item }) => (
                    <Text size="s" weight="semiBold" as="span">
                        {item.name}
                    </Text>
                )}
            >
                <SelectTrigger>
                    {nullable(
                        Number(selectedTags?.length) > 1 && selectedTags,
                        (t) => (
                            <Counter count={t.length} />
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
