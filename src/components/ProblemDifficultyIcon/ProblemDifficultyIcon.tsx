import { ProblemDifficulty } from '@prisma/client';
import { IconCircleSolid } from '@taskany/icons';
import { Popup } from '@taskany/bricks';
import { useRef, useState } from 'react';

import { difficultyToColor } from '../../utils';
import { problemDifficultyLabels } from '../../utils/dictionaries';

import { tr } from './ProblemDifficultyIcon.i18n';

interface Props {
    difficulty: ProblemDifficulty;
}

export const ProblemDifficultyIcon = ({ difficulty }: Props) => {
    const popupRef = useRef<HTMLDivElement>(null);
    const [popupVisible, setPopupVisibility] = useState(false);
    return (
        <>
            <IconCircleSolid
                onMouseEnter={() => setPopupVisibility(true)}
                onMouseLeave={() => setPopupVisibility(false)}
                ref={popupRef}
                size="s"
                color={difficultyToColor[difficulty]}
            />
            <Popup tooltip arrow={false} reference={popupRef} visible={popupVisible} placement="bottom-end">
                {tr('Difficulty:')} {problemDifficultyLabels[difficulty]}
            </Popup>
        </>
    );
};
