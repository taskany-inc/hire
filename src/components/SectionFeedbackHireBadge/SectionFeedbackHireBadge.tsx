import { VFC } from 'react';
import styled from 'styled-components';
import { SectionType } from '@prisma/client';
import { Badge } from '@taskany/bricks';

import { TagPaletteColor } from '../../utils/tagPalette';
import { SectionType as SectionTypeEnum } from '../../utils/dictionaries';

import { tr } from './SectionFeedbackHireBadge.i18n';

const StyledChip = styled(Badge)`
    margin-left: 1em;
`;

export const SectionFeedbackHireBadge: VFC<{ hire: boolean | null }> = ({ hire }) => {
    if (hire === null) {
        return (
            <StyledChip size="l" color={TagPaletteColor.BLUE}>
                {tr('New')}
            </StyledChip>
        );
    }

    if (hire) {
        return (
            <StyledChip size="l" color={TagPaletteColor.GREEN}>
                {tr('Hire')}
            </StyledChip>
        );
    }

    return (
        <StyledChip size="l" color={TagPaletteColor.RED}>
            {tr('No hire')}
        </StyledChip>
    );
};

export const SectionTypeBadge: VFC<{ sectionType: SectionType }> = ({ sectionType }) => {
    switch (sectionType.value) {
        case SectionTypeEnum.CODING:
            return (
                <StyledChip size="l" color={TagPaletteColor.CYAN}>
                    {sectionType.value}
                </StyledChip>
            );
        case SectionTypeEnum.FINAL:
            return (
                <StyledChip size="l" color={TagPaletteColor.PURPLE_GREY}>
                    {sectionType.value}
                </StyledChip>
            );
        case SectionTypeEnum.PRODUCT_FINAL:
            return (
                <StyledChip size="l" color={TagPaletteColor.YELLOW}>
                    {sectionType.value}
                </StyledChip>
            );
        default:
            return (
                <StyledChip size="l" color={TagPaletteColor.MAGENTA}>
                    {sectionType.value}
                </StyledChip>
            );
    }
};
