import { Problems } from '../../components/Problems/Problems';
import { createGetServerSideProps } from '../../utils/createGetSSRProps';

export const getServerSideProps = createGetServerSideProps({
    requireSession: true,
    action: async ({ ssg }) => {
        await ssg.problems.getList.fetchInfinite({
            limit: 20,
        });
    },
});

export default Problems;
