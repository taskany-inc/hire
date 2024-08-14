import { useState } from 'react';

import { CandidatesKanbanList } from '../CandidatesKanban/CandidatesKanban';
import { CandidateFilterBar } from '../CandidateFilterBar/CandidateFilterBar';
import { LayoutMain } from '../LayoutMain/LayoutMain';

import { tr } from './CandidatesKanbanPage.i18n';

const CandidatesKanbanPage = () => {
    const [loadingState, setLoadingState] = useState<boolean>();

    return (
        <LayoutMain pageTitle={tr('Dashboard')} aboveContainer={<CandidateFilterBar />} loading={loadingState}>
            <CandidatesKanbanList onLoadingStateChange={(state) => setLoadingState(state === 'loading')} />
        </LayoutMain>
    );
};

export default CandidatesKanbanPage;
