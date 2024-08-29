import {
    AppliedFilter,
    Checkbox,
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

import { tr } from './AppliedProblemAuthorsFilter.i18n';
import s from './AppliedProblemAuthorsFilter.module.css';

interface AppliedProblemAuthorsFilterProps {
    onCleanFilter: () => void;
    selectedAuthors: number[] | undefined;
    onChange: (authors: { id: string; name: string; email: string }[]) => void;
    onClose: () => void;
}

export const AppliedProblemAuthorsFilter: FC<AppliedProblemAuthorsFilterProps> = ({
    onCleanFilter,
    selectedAuthors,
    onChange,
    onClose,
}) => {
    const [authorQuery, setAuthorQuery] = useState('');
    const session = useSession();
    const { data: authors = [] } = trpc.users.suggestions.useQuery(
        {
            query: authorQuery,
            take: suggestionsTake - 1,
            include: session ? [session.user.id, ...(selectedAuthors ?? [])] : selectedAuthors,
        },
        useQueryOptions,
    );

    const authorValue = authors
        .filter((author) => selectedAuthors?.includes(author.id))
        .map((author) => ({
            ...author,
            id: author.id.toString(),
            name: `${author.name || author.email} ${author.id === session?.user.id ? tr('(You)') : ''}`,
        }));

    return (
        <AppliedFilter label={tr('Author')} action={<TagCleanButton size="s" onClick={onCleanFilter} />}>
            <Select
                arrow
                value={authorValue}
                items={authors.map((author) => ({
                    id: String(author.id),
                    name: `${author.name || author.email} ${author.id === session?.user.id ? tr('(You)') : ''}`,
                    email: author.email,
                }))}
                onClose={onClose}
                onChange={onChange}
                mode="multiple"
                renderItem={({ item }) => (
                    <Checkbox
                        label={
                            <User name={item.name} email={item.email} className={s.AppliedProblemAuthorsFilterUser} />
                        }
                        checked={selectedAuthors?.includes(+item.id)}
                        className={s.AppliedProblemAuthorsFilterCheckbox}
                    />
                )}
            >
                <SelectTrigger>
                    {nullable(
                        selectedAuthors && selectedAuthors?.length > 1,
                        () => (
                            <UserGroup users={authorValue} />
                        ),
                        nullable(authorValue[0], (user) => <User name={user.name} email={user.email} />),
                    )}
                </SelectTrigger>
                <SelectPanel placement="bottom">
                    <Input placeholder={tr('Search')} onChange={(e) => setAuthorQuery(e.target.value)} />
                </SelectPanel>
            </Select>
        </AppliedFilter>
    );
};
