import { IconBulbOnOutline } from '@taskany/icons';
import { warn8 } from '@taskany/colors';
import { Keyboard } from '@taskany/bricks';

import { Tip } from '../Tip';

import { tr } from './KeyboardSubmitHint.i18n';
import s from './KeyboardSubmitHint.module.css';

export interface KeyboardSubmitHintProps {
    actionTitle: string;
}

export const KeyboardSubmitHint = ({ actionTitle }: KeyboardSubmitHintProps) => {
    return (
        <div className={s.KeyboardSubmitHint}>
            <div className={s.KeyboardSubmitHintFormBottom}>
                <Tip icon={<IconBulbOnOutline size="s" color={warn8} />}>
                    {tr.raw('Take advice! {actionTitle} by pressing {key}', {
                        actionTitle,
                        key: <Keyboard command enter />,
                    })}
                </Tip>
            </div>
        </div>
    );
};
