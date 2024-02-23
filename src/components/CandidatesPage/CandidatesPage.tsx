import { CandidateListView } from '../CandidateListView/CandidateListView';
import { CandidateFilterBar } from '../CandidateFilterBar/CandidateFilterBar';
import { LayoutMain } from '../LayoutMain';
import { CandidateFilterContextProvider } from '../../contexts/candidateFilterContext';

import { tr } from './CandidatesPage.i18n';

const CandidatesPage = () => {
    return (
        <CandidateFilterContextProvider>
            <LayoutMain pageTitle={tr('Candidates')} aboveContainer={<CandidateFilterBar />}>
                <CandidateListView />
            </LayoutMain>
        </CandidateFilterContextProvider>
    );
};

export default CandidatesPage;
