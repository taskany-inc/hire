import { FC, useMemo, useRef, useState } from 'react';
import { Popup } from '@taskany/bricks/harmony';
import { SheepLogo } from '@taskany/bricks';

import { getRandomIndex } from '../../utils/getRandomIndex';

import s from './SheepLogoWithTips.module.css';
import { tr } from './SheepLogoWithTips.i18n';

const SheepLogoWithTips: FC = () => {
    const [index, setIndex] = useState(getRandomIndex(0));
    const [popupVisible, setPopupVisibility] = useState(false);
    const popupRef = useRef<HTMLDivElement>(null);

    const allTipsItems = useMemo(() => {
        const allTips = [
            tr('Your smile is my favorite kind of sunlight. Have a nice day!'),
            tr('Good day!'),
            tr('Hurray! Something interesting awaits you today!'),
            tr('Life is wonderful!'),
            tr("Don't worry, be happy"),
        ];

        return allTips;
    }, []);

    return (
        <>
            <div ref={popupRef}>
                <a
                    onClick={() => {
                        setPopupVisibility(true);
                        setIndex(getRandomIndex(index));
                    }}
                >
                    <SheepLogo />
                </a>
            </div>
            <Popup
                visible={popupVisible}
                placement="bottom-start"
                arrow={false}
                reference={popupRef}
                className={s.TipIcon}
                onClickOutside={() => setPopupVisibility(false)}
            >
                {allTipsItems[index]}
            </Popup>
        </>
    );
};

export default SheepLogoWithTips;
