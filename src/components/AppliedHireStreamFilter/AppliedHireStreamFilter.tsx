import React, { FC, useMemo, useState } from 'react';
import {
    AppliedFilter,
    Counter,
    Input,
    Select,
    Text,
    SelectPanel,
    SelectTrigger,
    TagCleanButton,
} from '@taskany/bricks/harmony';
import { nullable } from '@taskany/bricks';

import { trpc } from '../../trpc/trpcClient';
import { suggestionsTake, useQueryOptions } from '../../utils/suggestions';

import { tr } from './AppliedHireStreamFilter.i18n';

interface AppliedHireStreamFilterProps {
    onCleanFilter: () => void;
    selectedHireStreams: number[] | undefined;
    onChange: (hireStreams: { id: number }[]) => void;
    onClose: () => void;
}

export const AppliedHireStreamFilter: FC<AppliedHireStreamFilterProps> = ({
    onChange,
    onClose,
    onCleanFilter,
    selectedHireStreams,
}) => {
    const [query, setQuery] = useState('');

    const { data: hireStreams = [] } = trpc.hireStreams.suggestions.useQuery(
        { query, take: suggestionsTake, include: selectedHireStreams },
        useQueryOptions,
    );

    const hireStreamItems = useMemo(
        () => hireStreams.map((hireStream) => ({ id: hireStream.id, name: hireStream.name })),
        [hireStreams],
    );

    const value = hireStreams.filter((hrS) => selectedHireStreams?.includes(hrS.id));

    return (
        <AppliedFilter label={tr('Hire streams')} action={<TagCleanButton size="s" onClick={onCleanFilter} />}>
            <Select
                arrow
                value={value}
                items={hireStreamItems}
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
                        value.length > 1,
                        () => (
                            <Counter count={value.length} />
                        ),
                        nullable(value, ([{ name }]) => (
                            <Text size="s" ellipsis title={name}>
                                {name}
                            </Text>
                        )),
                    )}
                </SelectTrigger>
                <SelectPanel placement="bottom" title={tr('Suggestions')}>
                    <Input placeholder={tr('Search')} onChange={(e) => setQuery(e.target.value)} />
                </SelectPanel>
            </Select>
        </AppliedFilter>
    );
};
