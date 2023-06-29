import React from 'react';

import { ProblemList } from '../components/problems/ProblemList';
import { LayoutMain } from '../components/layout/LayoutMain';
import { ProblemFilterBar } from '../components/problems/problem-filter/ProblemFilterBar';

import { tr } from './controllers.i18n';

export const Problems = () => (
    <LayoutMain pageTitle={tr('Problems')} aboveContainer={<ProblemFilterBar />}>
        <ProblemList style={{ marginTop: 42 }} />
    </LayoutMain>
);
