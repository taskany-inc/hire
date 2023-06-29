import { CSSProperties, memo, useRef, useState } from 'react';
import styled from 'styled-components';
import dynamic from 'next/dynamic';
import { Text } from '@taskany/bricks';

import { tr } from './problems.i18n';

const Popup = dynamic(() => import('@taskany/bricks/components/Popup'));

type Stats = {
    good: number;
    ok: number;
    bad: number;
};

type ProblemStatsProps = Stats & {
    className?: string;
    style?: CSSProperties;
};

const rateToColor: Record<keyof Stats, string> = {
    bad: '#f85149',
    ok: '#fac905',
    good: '#18e022',
};

const StyledContainer = styled.div`
    width: 200px;
    height: 8px;
    display: flex;
    margin-bottom: 50px;
`;

const RateBar = styled.div<{ ratio: number; rate: keyof Stats }>`
    height: 6px;
    width: ${({ ratio }) => `${ratio}%`};
    background-color: ${({ rate }) => rateToColor[rate]};
`;

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
        <StyledContainer className={className} style={style}>
            <RateBar
                ref={popupRefGood}
                onMouseEnter={() => setPopupVisibilityGood(true)}
                onMouseLeave={() => setPopupVisibilityGood(false)}
                ratio={(good / total) * 100}
                rate="good"
            />
            <Popup tooltip placement="bottom-start" reference={popupRefGood} visible={popupVisibleGood}>
                <Text size="s">👍 {tr('Good solutions: {good} from {total}', { good, total })}</Text>
            </Popup>

            <RateBar
                ref={popupRefOk}
                onMouseEnter={() => setPopupVisibilityOk(true)}
                onMouseLeave={() => setPopupVisibilityOk(false)}
                ratio={(ok / total) * 100}
                rate="ok"
            />
            <Popup tooltip placement="bottom-start" reference={popupRefOk} visible={popupVisibleOk}>
                <Text size="s">👌 {tr('Ok solutions: {ok} from {total}', { ok, total })}</Text>
            </Popup>

            <RateBar
                ref={popupRefBad}
                onMouseEnter={() => setPopupVisibilityBad(true)}
                onMouseLeave={() => setPopupVisibilityBad(false)}
                ratio={(bad / total) * 100}
                rate="bad"
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
        </StyledContainer>
    );
});
