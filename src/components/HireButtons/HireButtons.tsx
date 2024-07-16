import { useMemo, useState } from 'react';
import { Switch, SwitchControl } from '@taskany/bricks/harmony';

import { SectionWithRelationsAndResults } from '../../modules/sectionTypes';

import { tr } from './HireButtons.i18n';
import s from './HireButtons.module.css';

export interface HireButtonsProps {
    section: SectionWithRelationsAndResults;
    setHire: (value: boolean | null) => void;
    setGrade: (value: string | null) => void;
}

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
        <div className={s.SwitchWrapper}>
            <Switch value={currentValue?.toString()}>
                {gradeButtons.map((button) => (
                    <SwitchControl
                        onClick={button.onClick}
                        key={button.title}
                        value={button.value.toString()}
                        text={button.title}
                        type="button"
                    />
                ))}
            </Switch>
        </div>
    );
};
