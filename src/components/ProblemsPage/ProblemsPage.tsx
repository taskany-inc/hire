import React from 'react';

import { ProblemList } from '../ProblemList/ProblemList';
import { LayoutMain } from '../LayoutMain/LayoutMain';
import { ProblemFilterBar } from '../ProblemFilterBar/ProblemFilterBar';

import { tr } from './ProblemsPage.i18n';

export const ProblemsPage = () => {
    return (
        <LayoutMain pageTitle={tr('Problems')} filterBar={<ProblemFilterBar title={tr('Problems')} />}>
            <ProblemList />
        </LayoutMain>
    );
};
