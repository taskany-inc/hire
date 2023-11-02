import { Problems } from '../../controllers/Problems';
import { createGetServerSideProps } from '../../utils/create-get-ssr-props';

export const getServerSideProps = createGetServerSideProps({
    requireSession: true,
    action: async ({ ssg }) => {
        await ssg.problems.getList.fetchInfinite({
            limit: 20,
        });
    },
});

export default Problems;
