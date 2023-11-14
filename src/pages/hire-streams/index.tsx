import { accessChecks } from '../../modules/accessChecks';
import HireStreamsPages from '../../components/HireStreamsPages/HireStreamsPages';
import { createGetServerSideProps } from '../../utils/createGetSSRProps';

export const getServerSideProps = createGetServerSideProps({
    requireSession: true,
    action: async ({ session, ssg, handleAccessChecks }) => {
        await ssg.hireStreams.getAll.fetch();

        await handleAccessChecks(() => accessChecks.hireStream.read(session));
    },
});

export default HireStreamsPages;
