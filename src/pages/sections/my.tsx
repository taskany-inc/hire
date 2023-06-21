import { InferServerSideProps } from '../../types';
import { LayoutMain } from '../../components/layout/LayoutMain';
import { sectionDbService } from '../../backend/modules/section/section-db-service';
import { SectionList } from '../../components/sections/SectionList';
import { createGetServerSideProps } from '../../utils/create-get-ssr-props';

import { tr } from './sections.i18n';

export const getServerSideProps = createGetServerSideProps({
    requireSession: true,
    action: async ({ session }) => {
        const completedSections = await sectionDbService.findAllInterviewerSections(session.user.id, true);
        const onGoingSections = await sectionDbService.findAllInterviewerSections(session.user.id, false);

        return { completedSections, onGoingSections };
    },
});

const MyInterviewsPage = ({ completedSections, onGoingSections }: InferServerSideProps<typeof getServerSideProps>) => {
    return (
        <LayoutMain pageTitle={tr('My sections')}>
            <SectionList sections={onGoingSections} />
            <SectionList sections={completedSections} header={tr('Passed sections')} completed />
        </LayoutMain>
    );
};

export default MyInterviewsPage;
