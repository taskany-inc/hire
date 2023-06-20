import { useMemo } from 'react';

import { SectionType } from '../../../utils/dictionaries';
import { DropdownFieldOption } from '../../inputs/DropdownField';
import { SectionWithSectionTypeAndInterviewerAndSolutionsRelations } from '../../../backend/modules/interview/interview-types';

export const useProductFinalSectionDropdownOptions = (
    interviewSections?: SectionWithSectionTypeAndInterviewerAndSolutionsRelations[],
): DropdownFieldOption<number>[] =>
    useMemo(() => {
        const productFinalSections =
            interviewSections?.filter(({ sectionType }) => sectionType.value === SectionType.PRODUCT_FINAL) ?? [];

        const sectionOptions = productFinalSections?.map(
            (section: SectionWithSectionTypeAndInterviewerAndSolutionsRelations): DropdownFieldOption<number> => {
                const sectionName = section.description ?? '';
                const interviewerName = section.interviewer.name;
                const text =
                    sectionName.length > 0
                        ? `${sectionName} (${interviewerName})`
                        : `Product final from ${interviewerName}`;

                return {
                    value: section.id,
                    text,
                };
            },
        );

        return [{ value: -1, text: 'Section not selected' }, ...sectionOptions];
    }, [interviewSections]);
