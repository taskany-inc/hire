import { useMemo, useState } from 'react';

import { SectionWithRelationsAndResults } from '../../modules/sectionTypes';
import { Stack } from '../Stack';
import { GradeButton } from '../GradeButton';

import { tr } from './HireButtons.i18n';

export type HireButtonsProps = {
    section: SectionWithRelationsAndResults;
    setHire: (value: boolean | null) => void;
    setGrade: (value: string | null) => void;
};

export const HireButtons = ({ section, setHire, setGrade }: HireButtonsProps): JSX.Element => {
    let defaultValue = null;

    if (section.hire === true) defaultValue = true;

    if (section.grade) defaultValue = section.grade;

    if (section.hire === false) defaultValue = false;

    const [currentValue, setCurrentValue] = useState<string | boolean | null>(defaultValue);

    const gradeButtons = useMemo(() => {
        const buttons = [
            {
                title: tr('NO HIRE'),
                value: false,
                onClick: () => {
                    setCurrentValue(false);
                    setHire(false);
                    setGrade(null);
                },
            },
            ...section.sectionType.gradeOptions.map((grade) => ({
                title: grade,
                value: grade,
                onClick: () => {
                    setCurrentValue(grade);
                    setGrade(grade);
                    setHire(true);
                },
            })),
        ];

        if (section.grade && !section.sectionType.gradeOptions.includes(section.grade)) {
            buttons.push({ title: section.grade, value: section.grade, onClick: () => {} });
        }

        return buttons;
    }, [section.sectionType.gradeOptions, section.grade, setGrade, setHire]);

    return (
        <Stack direction="row" gap={8} justifyContent="flex-start">
            <>
                {gradeButtons.map((button) => (
                    <GradeButton
                        key={button.title}
                        onClick={button.onClick}
                        matching={button.value === currentValue}
                        selected={button.value === currentValue}
                        type="button"
                    >
                        {button.title}
                    </GradeButton>
                ))}
            </>
        </Stack>
    );
};
