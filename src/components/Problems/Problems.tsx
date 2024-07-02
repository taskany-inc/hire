import React from 'react';

import { ProblemList } from '../ProblemList/ProblemList';
import { LayoutMain } from '../LayoutMain/LayoutMain';
import { ProblemFilterBar } from '../ProblemFilterBar/ProblemFilterBar';

import { tr } from './Problems.i18n';

export const Problems = () => (
    <LayoutMain pageTitle={tr('Problems')} aboveContainer={<ProblemFilterBar />}>
        <ProblemList style={{ marginTop: 42 }} />
    </LayoutMain>
);
