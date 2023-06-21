import { useMemo } from 'react';

import { SectionType } from '../../../utils/dictionaries';
import { DropdownFieldOption } from '../../inputs/DropdownField';
import { SectionWithSectionTypeAndInterviewerAndSolutionsRelations } from '../../../backend/modules/interview/interview-types';

import { tr } from './utils.i18n';

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
                        : `${tr('Product final from')} ${interviewerName}`;

                return {
                    value: section.id,
                    text,
                };
            },
        );

        return [{ value: -1, text: tr('Section not selected') }, ...sectionOptions];
    }, [interviewSections]);
