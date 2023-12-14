import { FilterAutoCompleteInput, FilterBase, FilterTabLabel, FormRadioInput, Tab } from '@taskany/bricks';
import { useMemo } from 'react';

export interface Filtertem {
    name: string;
    id: string;
}

interface DifficultyFilterProps {
    tabName: string;
    label: string;
    items: Filtertem[];
    filterCheckboxName: string;
    onChange: (items: string[]) => void;
    value?: string[];
    onSearchChange?: (query: string) => void;
    placeholder?: string;
}

const getKey = (groupOrRole: Filtertem) => groupOrRole.id;

export const DifficultyFilter = ({
    tabName,
    label,
    value = [],
    items,
    onChange,
    onSearchChange,
    placeholder,
}: DifficultyFilterProps) => {
    const values = useMemo(() => {
        return items.filter((g) => value.includes(getKey(g)));
    }, [items, value]);

    return (
        <Tab name={tabName} label={<FilterTabLabel text={label} selected={values.map(({ name }) => name)} />}>
            <FilterBase
                key={tabName}
                mode="multiple"
                viewMode="split"
                items={items}
                value={values}
                keyGetter={getKey}
                onChange={onChange}
                renderItem={({ item, onItemClick }) => (
                    <FormRadioInput key={item.name} value={item.name} label={item.name} onClick={onItemClick} />
                )}
            >
                {onSearchChange && <FilterAutoCompleteInput placeholder={placeholder} onChange={onSearchChange} />}
            </FilterBase>
        </Tab>
    );
};
