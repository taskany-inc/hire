import { VacanciesPage } from '../../components/VacanciesPage/VacanciesPage';
import { accessChecks } from '../../modules/accessChecks';
import { createGetServerSideProps } from '../../utils/createGetSSRProps';

export const getServerSideProps = createGetServerSideProps({
    requireSession: true,
    action: async ({ ssg, session, handleAccessChecks }) => {
        await ssg.crew.getVacancyList.fetchInfinite({ archived: false });
        await ssg.hireStreams.getAll.fetch();
        await handleAccessChecks(() => accessChecks.vacancy.read(session));
    },
});

export default VacanciesPage;
