import { FilterAutoCompleteInput, FilterBase, FilterCheckbox, FilterTabLabel, Tab, UserPic } from '@taskany/bricks';
import { useMemo } from 'react';

export interface Filtertem {
    name: string;
    id: string;
    email?: string;
}

interface FilterProps {
    tabName: string;
    label: string;
    items: Filtertem[];
    filterCheckboxName: string;
    onChange: (items: string[]) => void;
    viewMode: 'union' | 'split';
    value?: string[];
    onSearchChange?: (query: string) => void;
    placeholder?: string;
    title?: string;
}

const getKey = (groupOrRole: Filtertem) => groupOrRole.id;

export const Filter = ({
    tabName,
    label,
    filterCheckboxName,
    value = [],
    items,
    onChange,
    onSearchChange,
    placeholder,
    title,
    viewMode,
}: FilterProps) => {
    const values = useMemo(() => {
        return items.filter((g) => value.includes(getKey(g)));
    }, [items, value]);

    return (
        <Tab name={tabName} label={<FilterTabLabel text={label} selected={values.map(({ name }) => name)} />}>
            <FilterBase
                key={tabName}
                title={title}
                mode="multiple"
                viewMode={viewMode}
                items={items}
                value={values}
                keyGetter={getKey}
                onChange={onChange}
                renderItem={({ item, onItemClick, checked }) => (
                    <FilterCheckbox
                        name={filterCheckboxName}
                        value={item.id}
                        checked={checked}
                        onClick={onItemClick}
                        label={item.name}
                        iconLeft={item.email && <UserPic name={item.name} email={item.email} size={14} />}
                    />
                )}
            >
                {onSearchChange && <FilterAutoCompleteInput placeholder={placeholder} onChange={onSearchChange} />}
            </FilterBase>
        </Tab>
    );
};
