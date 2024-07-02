import { SectionWithInterviewRelation } from '../../modules/interviewTypes';
import { LayoutMain } from '../LayoutMain/LayoutMain';
import { SectionList } from '../SectionList/SectionList';

import { tr } from './MyInterviewsPage.i18n';

export interface MyInterviewsPageProps {
    onGoingSections: SectionWithInterviewRelation[];
    completedSections: SectionWithInterviewRelation[];
}

const MyInterviewsPage = ({ onGoingSections, completedSections }: MyInterviewsPageProps) => {
    return (
        <LayoutMain pageTitle={tr('My sections')}>
            <SectionList sections={onGoingSections} />
            <SectionList sections={completedSections} header={tr('Passed sections')} completed />
        </LayoutMain>
    );
};

export default MyInterviewsPage;
