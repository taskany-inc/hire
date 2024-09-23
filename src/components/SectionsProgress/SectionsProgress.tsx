import { FC, HTMLAttributes, useMemo, useRef, useState } from 'react';
import { CircleProgressBar, FlatProgressBar, Popup } from '@taskany/bricks/harmony';
import { nullable, useClickOutside } from '@taskany/bricks';

import { SectionWithSectionType } from '../../modules/sectionTypes';
import { SectionResults } from '../SectionResults/SectionResults';

import s from './SectionsProgress.module.css';

interface SectionsProgressProps extends HTMLAttributes<HTMLDivElement> {
    sections: SectionWithSectionType[];
    gradeVisibility?: boolean;
    view?: 'flat' | 'circle';
}

export const SectionsProgress: FC<SectionsProgressProps> = ({ sections, view = 'flat', gradeVisibility, ...rest }) => {
    const [popupVisible, setPopupVisible] = useState(false);
    const triggerRef = useRef<HTMLDivElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const finished = useMemo(() => sections.filter((section) => section.hire !== null), [sections]);

    useClickOutside(wrapperRef, ({ target }) => {
        if (!popupVisible) {
            return;
        }

        if (target instanceof HTMLElement) {
            if (!wrapperRef.current?.contains(target)) {
                setPopupVisible(false);
            }
        }
    });

    const value = sections.length ? Math.floor((finished.length * 100) / sections.length) : 0;

    return (
        <>
            <div ref={triggerRef} onClick={() => setPopupVisible(true)} {...rest}>
                {nullable(
                    view === 'flat',
                    () => (
                        <FlatProgressBar value={value} />
                    ),
                    <CircleProgressBar className={s.CandidateKanbanSectionProgressTrigger_circle} value={value} />,
                )}
            </div>
            <Popup
                reference={triggerRef}
                className={s.CandidateKanbanSectionProgressPopup}
                visible={popupVisible}
                placement="top-end"
                offset={[10, 10]}
            >
                <div className={s.CandidateKanbanSectionProgress} ref={wrapperRef}>
                    <SectionResults passedSections={sections} gradeVisibility={gradeVisibility} />
                </div>
            </Popup>
        </>
    );
};
