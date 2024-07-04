import { useState } from 'react';
import { nullable } from '@taskany/bricks';
import { Switch, SwitchControl } from '@taskany/bricks/harmony';

import { AddOrUpdateCandidate } from '../AddOrUpdateCandidate/AddOrUpdateCandidate';
import { LayoutMain } from '../LayoutMain/LayoutMain';
import { AddCandidateByCv } from '../AddCandidateByCv/AddCandidateByCv';

import s from './NewCandidatePage.module.css';
import { tr } from './NewCandidatePage.i18n';

type Mode = 'manual' | 'auto';

const NewCandidatePage = () => {
    const [mode, setMode] = useState<Mode>('manual');

    return (
        <LayoutMain pageTitle={tr('New candidate')}>
            <Switch value={mode} onChange={(_event, active) => setMode(active as Mode)} className={s.Switch}>
                <SwitchControl text={tr('Manual')} value="manual" />
                <SwitchControl text={tr('Auto')} value="auto" />
            </Switch>

            {nullable(mode === 'manual', () => (
                <AddOrUpdateCandidate variant="new" />
            ))}

            {nullable(mode === 'auto', () => (
                <AddCandidateByCv />
            ))}
        </LayoutMain>
    );
};

export default NewCandidatePage;
