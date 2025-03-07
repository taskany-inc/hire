import { FC } from 'react';
import { Popup } from '@taskany/bricks/harmony';

// import { I18nKey, tr } from './RotatableTip.i18n';
import s from './RotatableTip.module.css';

type TipContext = 'message1' | 'message2' | 'message3' | 'message4' | 'message5';

interface RotatableTipProps {
    context?: TipContext;
}

const RotatableTip: FC<RotatableTipProps> = () => {
    // const generateTip = useCallback((text: I18nKey, options?: { ctx?: TipContext } & Record<string, ReactNode>) => {
    //     return tr.raw(text, {
    //         text: <Text />,
    //         // entity: options?.ctx ? tr(options.ctx) : '',
    //         ...options,
    //     });
    // }, []);

    // const tips: ((ctx?: TipContext) => ReactNode)[] = useMemo(() => {
    //     return [
    //         () =>
    //             generateTip('{key}!', {
    //                 key: <Text key="h">h</Text>,
    //             }),
    //     ];
    // }, [generateTip]);

    // const contextTips: Record<TipContext, ((ctx?: TipContext) => ReactNode)[]> = useMemo(() => {
    //     return {
    //         var1: [(ctx) => generateTip('{key}!', { ctx })],
    //     };
    // }, [generateTip]);

    // const allTips = useMemo(() => {
    //     return [...tips, ...(context ? contextTips[context] : [])];
    // }, [context, contextTips, tips]);

    // const randomIndex = useMemo(() => Math.floor(Math.random() * allTips.length), [allTips.length]);

    return <Popup className={s.TipIcon}>{/* {allTips[randomIndex](context)} */}</Popup>;
};

export default RotatableTip;
