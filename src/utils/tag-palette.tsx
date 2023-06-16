import { InterviewStatus } from '@prisma/client';

import { SectionStatus } from './dictionaries';

// TODO: fix false positive no-shadow
// eslint-disable-next-line no-shadow
export enum TagPaletteColor {
    CYAN = '#0DBBBB',
    YELLOW = '#FFFF00',
    RED = '#D74F4F',
    GREEN = '#3DFFC5',
    MAGENTA = '#FF2990',
    PURPLE_GREY = '#5a7fb9',
    DARK_ORANGE = '#FF9800',
    BLUE = '#29CCFF',
    LIGHT_GREEN = '#4CAF50',
    PINK_RASPBERRY = '#9C27B0',
}

export const InterviewStatusTagPalette: Record<InterviewStatus, TagPaletteColor> = {
    [InterviewStatus.HIRED]: TagPaletteColor.GREEN,
    [InterviewStatus.NEW]: TagPaletteColor.YELLOW,
    [InterviewStatus.IN_PROGRESS]: TagPaletteColor.YELLOW,
    [InterviewStatus.REJECTED]: TagPaletteColor.RED,
};

export const SectionStatusTagPalette: Record<SectionStatus, TagPaletteColor> = {
    [SectionStatus.HIRE]: TagPaletteColor.GREEN,
    [SectionStatus.NO_HIRE]: TagPaletteColor.RED,
    [SectionStatus.NEW]: TagPaletteColor.BLUE,
};

export const tagPalette = [
    TagPaletteColor.CYAN,
    TagPaletteColor.YELLOW,
    TagPaletteColor.DARK_ORANGE,
    TagPaletteColor.LIGHT_GREEN,
    TagPaletteColor.PINK_RASPBERRY,
    TagPaletteColor.MAGENTA,
    TagPaletteColor.GREEN,
    TagPaletteColor.BLUE,
    TagPaletteColor.PURPLE_GREY,
];

export const getTagColor = (id: number): TagPaletteColor => tagPalette[id % tagPalette.length];
