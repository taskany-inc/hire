import { nullable } from '@taskany/bricks';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

import { usePreviewContext } from '../../contexts/previewContext';
import { SectionPreview } from '../SectionPreview/SectionPreview';

export const Previews = () => {
    const { sectionId, hidePreview } = usePreviewContext();
    const router = useRouter();
    const { pathname } = router;
    console.log('sectionId - Previews', sectionId);
    useEffect(() => {
        hidePreview();
    }, [pathname, hidePreview]);

    return (
        <>
            {nullable(sectionId, (s) => (
                <SectionPreview sectionId={s} />
            ))}
        </>
    );
};
