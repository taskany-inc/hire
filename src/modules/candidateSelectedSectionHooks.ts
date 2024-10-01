import { useMemo } from 'react';

import { SectionType } from '../utils/dictionaries';

import { SectionWithSectionTypeAndInterviewerAndSolutionsRelations } from './interviewTypes';
import { tr } from './modules.i18n';

export const useProductFinalSectionDropdownOptions = (
    interviewSections?: SectionWithSectionTypeAndInterviewerAndSolutionsRelations[],
): { id: number; text: string }[] =>
    useMemo(() => {
        const productFinalSections =
            interviewSections?.filter(({ sectionType }) => sectionType.value === SectionType.PRODUCT_FINAL) ?? [];

        const sectionOptions = productFinalSections?.map(
            (section: SectionWithSectionTypeAndInterviewerAndSolutionsRelations): { id: number; text: string } => {
                const sectionName = section.description ?? '';
                const interviewerNames = section.interviewers.map((i) => i.name).join(', ');
                const text =
                    sectionName.length > 0
                        ? `${sectionName} (${interviewerNames})`
                        : `${tr('Product final from')} ${interviewerNames}`;

                return {
                    id: section.id,
                    text,
                };
            },
        );

        return [{ id: -1, text: tr('Section not selected') }, ...sectionOptions];
    }, [interviewSections]);
