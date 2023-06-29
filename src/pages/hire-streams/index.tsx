import { accessChecks } from '../../backend/access/access-checks';
import HireStreamsPages from '../../controllers/HireStreamsPages';
import { createGetServerSideProps } from '../../utils/create-get-ssr-props';

export const getServerSideProps = createGetServerSideProps({
    requireSession: true,
    action: async ({ session, ssg, handleAccessChecks }) => {
        await ssg.hireStreams.getAll.fetch();

        await handleAccessChecks(() => accessChecks.hireStream.read(session));
    },
});

export default HireStreamsPages;
