import { useRouter } from 'next/router';
import { LayoutMain } from '../components/layout/LayoutMain';
import { HireStreamForm } from '../components/hire-streams/HireStreamForm';
import { pageHrefs } from '../utils/paths';

import { tr } from './controllers.i18n';

const NewHireStreamPage = () => {
    const router = useRouter();

    return (
        <LayoutMain pageTitle={tr('New hire stream')}>
            <HireStreamForm afterSubmit={(hireStream) => router.push(pageHrefs.hireStream(hireStream.id))} />
        </LayoutMain>
    );
};

export default NewHireStreamPage;
