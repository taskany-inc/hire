import { PluginPage } from '../plugins/PluginPage';
import { createGetServerSideProps } from '../utils/createGetSSRProps';

export const getServerSideProps = createGetServerSideProps({
    requireSession: true,
});

export default () => {
    return <PluginPage />;
};
