import {
    AppliedFilter,
    Input,
    Select,
    SelectPanel,
    SelectTrigger,
    TagCleanButton,
    User,
    UserGroup,
} from '@taskany/bricks/harmony';
import React, { FC, useState } from 'react';
import { nullable } from '@taskany/bricks';

import { trpc } from '../../trpc/trpcClient';
import { suggestionsTake, useQueryOptions } from '../../utils/suggestions';
import { useSession } from '../../contexts/appSettingsContext';

import { tr } from './AppliedUserFilter.i18n';

interface AppliedUserFilterProps {
    label: string;
    hr?: boolean;
    onCleanFilter: () => void;
    selectedUsers: number[] | undefined;
    onChange: (authors: { id: number; name: string; email: string }[]) => void;
    onClose: () => void;
}

export const AppliedUserFilter: FC<AppliedUserFilterProps> = ({
    label,
    hr,
    onCleanFilter,
    selectedUsers,
    onChange,
    onClose,
}) => {
    const [authorQuery, setAuthorQuery] = useState('');
    const session = useSession();
    const { data: authors = [] } = trpc.users.suggestions.useQuery(
        {
            hr,
            query: authorQuery,
            take: suggestionsTake - 1,
            include: session ? [session.user.id, ...(selectedUsers ?? [])] : selectedUsers,
        },
        useQueryOptions,
    );

    const authorValue = authors
        .filter((author) => selectedUsers?.includes(author.id))
        .map((author) => ({
            ...author,
            name: `${author.name || author.email} ${author.id === session?.user.id ? tr('(You)') : ''}`,
        }));

    return (
        <AppliedFilter label={label} action={<TagCleanButton size="s" onClick={onCleanFilter} />}>
            <Select
                arrow
                value={authorValue}
                items={authors.map((author) => ({
                    ...author,
                    name: `${author.name || author.email} ${author.id === session?.user.id ? tr('(You)') : ''}`,
                    email: author.email,
                }))}
                onClose={onClose}
                onChange={onChange}
                selectable
                mode="multiple"
                renderItem={({ item }) => <User name={item.name} email={item.email} />}
            >
                <SelectTrigger>
                    {nullable(
                        selectedUsers && selectedUsers?.length > 1,
                        () => (
                            <UserGroup users={authorValue} />
                        ),
                        nullable(authorValue[0], (user) => <User name={user.name} email={user.email} />),
                    )}
                </SelectTrigger>
                <SelectPanel placement="bottom" title={tr('Suggestions')}>
                    <Input placeholder={tr('Search')} onChange={(e) => setAuthorQuery(e.target.value)} />
                </SelectPanel>
            </Select>
        </AppliedFilter>
    );
};
