import { nullable } from '@taskany/bricks';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

import { usePreviewContext } from '../../contexts/previewContext';
import { SectionPreview } from '../SectionPreview/SectionPreview';
import { AddProblemToSectionPreviewProps } from '../AddProblemToSectionPreview/AddProblemToSectionPreview';

export const Previews = () => {
    const { sectionId, problemToSectionPreview, hidePreview } = usePreviewContext();
    const router = useRouter();

    const { pathname } = router;
    useEffect(() => {
        hidePreview();
    }, [pathname, hidePreview]);
    return (
        <>
            {nullable(sectionId, (s) => (
                <SectionPreview sectionId={s} />
            ))}
            {nullable(problemToSectionPreview, () => (
                <AddProblemToSectionPreviewProps problemPreview={problemToSectionPreview} />
            ))}
        </>
    );
};
