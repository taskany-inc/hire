import { VFC } from 'react';
import { SectionType } from '@prisma/client';
import { Badge } from '@taskany/bricks';

import { TagPaletteColor } from '../../utils/tagPalette';
import { SectionType as SectionTypeEnum } from '../../utils/dictionaries';

import { tr } from './SectionFeedbackHireBadge.i18n';

export const SectionFeedbackHireBadge: VFC<{ hire: boolean | null }> = ({ hire }) => {
    if (hire === null) {
        return (
            <Badge size="l" color={TagPaletteColor.BLUE}>
                {tr('New')}
            </Badge>
        );
    }

    if (hire) {
        return (
            <Badge size="l" color={TagPaletteColor.GREEN}>
                {tr('Hire')}
            </Badge>
        );
    }

    return (
        <Badge size="l" color={TagPaletteColor.RED}>
            {tr('No hire')}
        </Badge>
    );
};

export const SectionTypeBadge: VFC<{ sectionType: SectionType }> = ({ sectionType }) => {
    switch (sectionType.value) {
        case SectionTypeEnum.CODING:
            return (
                <Badge size="l" color={TagPaletteColor.CYAN}>
                    {sectionType.value}
                </Badge>
            );
        case SectionTypeEnum.FINAL:
            return (
                <Badge size="l" color={TagPaletteColor.PURPLE_GREY}>
                    {sectionType.value}
                </Badge>
            );
        case SectionTypeEnum.PRODUCT_FINAL:
            return (
                <Badge size="l" color={TagPaletteColor.SOFT_BLUE}>
                    {sectionType.value}
                </Badge>
            );
        default:
            return (
                <Badge size="l" color={TagPaletteColor.MAGENTA}>
                    {sectionType.value}
                </Badge>
            );
    }
};
