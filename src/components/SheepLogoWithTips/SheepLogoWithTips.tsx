import { FC, useMemo, useRef, useState } from 'react';
import { Popup } from '@taskany/bricks/harmony';
import { SheepLogo } from '@taskany/bricks';

import { trpc } from '../../trpc/trpcClient';
import { getRandomIndex } from '../../utils/getRandomIndex';

import s from './SheepLogoWithTips.module.css';
import { tr } from './SheepLogoWithTips.i18n';

const SheepLogoWithTips: FC = () => {
    const [popupVisible, setPopupVisibility] = useState(false);
    const [aiPhrase, setAiPhrase] = useState<string | undefined>();
    const popupRef = useRef<HTMLDivElement>(null);

    const allTips = useMemo(() => {
        return [
            tr('Your smile is my favorite kind of sunlight. Have a nice day!'),
            tr('Good day!'),
            tr('Hurray! Something interesting awaits you today!'),
            tr('Life is wonderful!'),
            tr("Don't worry, be happy"),
        ];
    }, []);

    const sheepPhraseMutation = trpc.aiAssistant.getSheepPhrase.useQuery(undefined, {
        enabled: false,
        retry: false,
    });

    const handleSheepClick = async () => {
        try {
            const result = await sheepPhraseMutation.refetch();

            if (result.data) {
                setAiPhrase(result.data);
            } else {
                setAiPhrase(allTips[getRandomIndex(allTips.length)]);
            }
            setPopupVisibility(true);
        } catch (error) {
            console.error('Failed to fetch sheep phrase:', error);
        }
    };

    return (
        <>
            <div ref={popupRef}>
                <a onClick={handleSheepClick}>
                    <SheepLogo />
                </a>
            </div>
            <Popup
                visible={popupVisible}
                placement="bottom-start"
                arrow={false}
                maxWidth={280}
                reference={popupRef}
                className={s.TipIcon}
                onClickOutside={() => setPopupVisibility(false)}
            >
                {aiPhrase}
            </Popup>
        </>
    );
};

export default SheepLogoWithTips;
