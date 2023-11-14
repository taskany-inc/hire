import { createGetServerSideProps } from '../../utils/createGetSSRProps';
import NewProblemPage from '../../components/NewProblemPage/NewProblemPage';

export const getServerSideProps = createGetServerSideProps({
    requireSession: true,
    action: async ({ ssg }) => {
        await ssg.tags.getAll.fetch();
    },
});

export default NewProblemPage;
