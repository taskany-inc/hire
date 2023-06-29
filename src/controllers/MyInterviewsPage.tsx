import { SectionWithInterviewRelation } from '../backend/modules/interview/interview-types';
import { LayoutMain } from '../components/layout/LayoutMain';
import { SectionList } from '../components/sections/SectionList';

import { tr } from './controllers.i18n';

export type MyInterviewsPageProps = {
    onGoingSections: SectionWithInterviewRelation[];
    completedSections: SectionWithInterviewRelation[];
};

const MyInterviewsPage = ({ onGoingSections, completedSections }: MyInterviewsPageProps) => {
    return (
        <LayoutMain pageTitle={tr('My sections')}>
            <SectionList sections={onGoingSections} />
            <SectionList sections={completedSections} header={tr('Passed sections')} completed />
        </LayoutMain>
    );
};

export default MyInterviewsPage;
