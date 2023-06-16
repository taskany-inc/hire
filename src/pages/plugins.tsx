import { PluginPage } from '../plugins/PluginPage';
import { createGetServerSideProps } from '../utils/create-get-ssr-props';

export const getServerSideProps = createGetServerSideProps({
    requireSession: true,
});

export default () => {
    return <PluginPage />;
};
