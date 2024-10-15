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

import { useVacancies } from '../../modules/crewHooks';
import { Vacancy } from '../../modules/crewTypes';

import { tr } from './AppliedVacanciesFilter.i18n';

interface AppliedVacanciesFilterProps {
    onCleanFilter: () => void;
    selectedVancies: string[] | undefined;
    onChange: (hireStreams: { id: string }[]) => void;
    onClose: () => void;
}

const vacancyToString = (vacancy: Vacancy) => {
    let result = vacancy.name;
    if (vacancy.grade !== null) {
        result += `, ${tr('grade')}: ${vacancy.grade}`;
    }
    if (vacancy.unit) {
        result += `, ${tr('unit')}: ${vacancy.unit}`;
    }
    return result;
};

export const AppliedVacanciesFilter: FC<AppliedVacanciesFilterProps> = ({
    onChange,
    onClose,
    onCleanFilter,
    selectedVancies,
}) => {
    const [query, setQuery] = useState('');

    const vacanciesQuery = useVacancies({ archived: false, take: 5, search: query });
    const items = useMemo(() => {
        const vacancies = vacanciesQuery.data?.pages[0].vacancies ?? [];
        return vacancies.map((vacancy) => ({ id: vacancy.id, name: vacancyToString(vacancy) }));
    }, [vacanciesQuery]);

    const value = items.filter((vac) => selectedVancies?.includes(vac.id));

    return (
        <AppliedFilter label={tr('Vacancies')} action={<TagCleanButton size="s" onClick={onCleanFilter} />}>
            <Select
                arrow
                value={value}
                items={items}
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
