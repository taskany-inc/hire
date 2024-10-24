import { useMemo } from 'react';
import { SectionType } from '@prisma/client';
import { Badge } from '@taskany/bricks/harmony';

import { TagPaletteColor } from '../../utils/tagPalette';
import { SectionType as SectionTypeEnum } from '../../utils/dictionaries';

import { tr } from './SectionFeedbackHireBadge.i18n';

export const SectionFeedbackHireBadge = ({ hire }: { hire: boolean | null }) => {
    const text = useMemo(() => {
        if (hire === null) return tr('New');
        if (hire) return tr('Hire');
        return tr('No hire');
    }, [hire]);

    const color = useMemo(() => {
        if (hire === null) return TagPaletteColor.BLUE;
        if (hire) return TagPaletteColor.GREEN;
        return TagPaletteColor.RED;
    }, [hire]);

    return <Badge color={color} text={text} size="s" weight="regular" view="outline" />;
};

export const useSectionTypeColor = (value: string) => {
    switch (value) {
        case SectionTypeEnum.CODING:
            return TagPaletteColor.CYAN;
        case SectionTypeEnum.FINAL:
            return TagPaletteColor.PURPLE_GREY;
        case SectionTypeEnum.PRODUCT_FINAL:
            return TagPaletteColor.SOFT_BLUE;
        default:
            return TagPaletteColor.MAGENTA;
    }
};

export const SectionTypeBadge = ({ sectionType }: { sectionType: SectionType }) => {
    const color = useSectionTypeColor(sectionType.value);

    return <Badge color={color} text={sectionType.value} size="s" weight="regular" view="outline" />;
};
