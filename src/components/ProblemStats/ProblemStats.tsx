import { CSSProperties, memo, useRef, useState } from 'react';
import { Popup, Text } from '@taskany/bricks';
import cn from 'classnames';

import { tr } from './ProblemStats.i18n';
import s from './ProblemStats.module.css';

interface Stats {
    good: number;
    ok: number;
    bad: number;
}

type ProblemStatsProps = Stats & {
    className?: string;
    style?: CSSProperties;
};

export const ProblemStats = memo(({ good, ok, bad, className, style }: ProblemStatsProps) => {
    const total = good + ok + bad;
    const [popupVisibleGood, setPopupVisibilityGood] = useState(false);
    const [popupVisibleOk, setPopupVisibilityOk] = useState(false);
    const [popupVisibleBad, setPopupVisibilityBad] = useState(false);

    const popupRefGood = useRef<HTMLDivElement>(null);
    const popupRefOk = useRef<HTMLDivElement>(null);
    const popupRefBad = useRef<HTMLDivElement>(null);

    if (total === 0) {
        return (
            <Text size="s" className={className} style={style}>
                🤷‍♀️ {tr('Nobody has solved this problem yet')}
            </Text>
        );
    }

    return (
        <div style={style} className={cn(s.ProblemStatsContainer, className)}>
            <div
                ref={popupRefGood}
                onMouseEnter={() => setPopupVisibilityGood(true)}
                onMouseLeave={() => setPopupVisibilityGood(false)}
                style={{ width: `${(good / total) * 100}%` }}
                className={s.ProblemStatsRateBarGood}
            />
            <Popup tooltip placement="bottom-start" reference={popupRefGood} visible={popupVisibleGood}>
                <Text size="s">👍 {tr('Good solutions: {good} from {total}', { good, total })}</Text>
            </Popup>

            <div
                ref={popupRefOk}
                onMouseEnter={() => setPopupVisibilityOk(true)}
                onMouseLeave={() => setPopupVisibilityOk(false)}
                style={{ width: `${(ok / total) * 100}%` }}
                className={s.ProblemStatsRateBarOk}
            />
            <Popup tooltip placement="bottom-start" reference={popupRefOk} visible={popupVisibleOk}>
                <Text size="s">👌 {tr('Ok solutions: {ok} from {total}', { ok, total })}</Text>
            </Popup>

            <div
                ref={popupRefBad}
                onMouseEnter={() => setPopupVisibilityBad(true)}
                onMouseLeave={() => setPopupVisibilityBad(false)}
                style={{ width: `${(bad / total) * 100}%` }}
                className={s.ProblemStatsRateBarBad}
            />
            <Popup tooltip placement="bottom-start" reference={popupRefBad} visible={popupVisibleBad}>
                <Text size="s">
                    👎{' '}
                    {tr('Bad solutions or not soluted at all: {bad} from {total}', {
                        bad,
                        total,
                    })}
                </Text>
            </Popup>
        </div>
    );
});
