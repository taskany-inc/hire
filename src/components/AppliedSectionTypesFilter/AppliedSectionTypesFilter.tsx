import React, { FC, useMemo } from 'react';
import {
    AppliedFilter,
    Counter,
    Select,
    Text,
    SelectPanel,
    SelectTrigger,
    TagCleanButton,
} from '@taskany/bricks/harmony';
import { nullable } from '@taskany/bricks';

import { useSectionTypes } from '../../modules/sectionTypeHooks';
import { useFiltersContext } from '../../contexts/filtersContext';

import { tr } from './AppliedSectionTypesFilter.i18n';

interface AppliedSectionTypesFilterProps {
    onCleanFilter: () => void;
    selectedSectionTypes: number[] | undefined;
    onChange: (sectionTypes: { id: number }[]) => void;
    onClose: () => void;
}

export const AppliedSectionTypesFilter: FC<AppliedSectionTypesFilterProps> = ({
    onChange,
    onClose,
    onCleanFilter,
    selectedSectionTypes,
}) => {
    const { hireStreamId } = useFiltersContext();

    const { data = [] } = useSectionTypes(hireStreamId as number, {
        enabled: typeof hireStreamId !== 'number',
    });

    const hireStreamItems = useMemo(
        () => data.map((sectionType) => ({ id: sectionType.id, name: sectionType.title })),
        [data],
    );

    const value = hireStreamItems.filter((hrS) => selectedSectionTypes?.includes(hrS.id));

    return (
        <AppliedFilter label={tr('Section types')} action={<TagCleanButton size="s" onClick={onCleanFilter} />}>
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
                {nullable(data, () => (
                    <SelectPanel placement="bottom" />
                ))}
            </Select>
        </AppliedFilter>
    );
};
