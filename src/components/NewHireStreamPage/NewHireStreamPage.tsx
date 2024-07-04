import { useRouter } from 'next/router';

import { pageHrefs } from '../../utils/paths';
import { LayoutMain } from '../LayoutMain/LayoutMain';
import { HireStreamForm } from '../HireStreamForm/HireStreamForm';

import { tr } from './NewHireStreamPage.i18n';

const NewHireStreamPage = () => {
    const router = useRouter();

    return (
        <LayoutMain pageTitle={tr('New hire stream')}>
            <HireStreamForm afterSubmit={(hireStream) => router.push(pageHrefs.hireStream(hireStream.id))} />
        </LayoutMain>
    );
};

export default NewHireStreamPage;
