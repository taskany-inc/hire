import { CandidateListView } from '../CandidateListView/CandidateListView';
import { CandidateFilterBar } from '../CandidateFilterBar/CandidateFilterBar';
import { LayoutMain } from '../LayoutMain/LayoutMain';

import { tr } from './CandidatesPage.i18n';

const CandidatesPage = () => {
    return (
        <LayoutMain pageTitle={tr('Candidates')} filterBar={<CandidateFilterBar title={tr('Candidates')} />}>
            <CandidateListView />
        </LayoutMain>
    );
};

export default CandidatesPage;
