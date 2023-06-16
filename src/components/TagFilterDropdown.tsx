import React, { FC, useMemo } from 'react';
import { FiltersDropdown } from '@taskany/bricks';
import { Tag } from '@prisma/client';

export type DropdownMenuItem = {
    onClick: VoidFunction;
    hint?: string;
    disabled?: boolean;
    text: string;
    highlight?: boolean;
};

export const TagFilterDropdown: FC<{
    text: string;
    value: number[];
    tags: Tag[];
    onChange: (value: number[]) => void;
}> = ({ text, value, tags, onChange }) => {
    const items = useMemo(() => tags.map(({ id, name }) => ({ id: id.toString(), data: name })), [tags]);

    return (
        <FiltersDropdown
            text={text}
            value={value.map((s) => s.toString())}
            items={items}
            onChange={(values: string[]) => onChange(values.map((v) => parseInt(v, 10)))}
        />
    );
};
