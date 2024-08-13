import React, { FC } from 'react';
import { Badge } from '@taskany/bricks/harmony';

import { getTagColor } from '../utils/tagPalette';

type BadgeProps = JSX.LibraryManagedAttributes<typeof Badge, React.ComponentProps<typeof Badge>>;

type TagChipProps = Omit<BadgeProps, 'size' | 'children' | 'label' | 'color'> & {
    tag: {
        id: number;
        name: string;
        color?: string | null;
    };
};

export const TagChip: FC<TagChipProps> = ({ tag, className, ...restProps }) => {
    const color = tag.color ?? getTagColor(tag.id);

    return <Badge size="s" weight="regular" view="outline" color={color} text={tag.name} {...restProps} />;
};
