import { createGetServerSideProps } from '../../utils/create-get-ssr-props';
import NewProblemPage from '../../controllers/NewProblemPage';

export const getServerSideProps = createGetServerSideProps({
    requireSession: true,
    action: async ({ ssg }) => {
        await ssg.tags.getAll.fetch();
    },
});

export default NewProblemPage;
