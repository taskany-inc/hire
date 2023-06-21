import { useEffect } from 'react';
import { useRouter } from 'next/router';

import { tr } from './hooks.i18n';

export const useWarnIfUnsavedChanges = (unsavedChanges: boolean) => {
    const router = useRouter();
    useEffect(() => {
        const confirmationMessage = `📛 ${tr('Leave the page? Changes will not be saved.')} 📛`;
        const beforeRouteHandler = (url: string) => {
            if (router.asPath !== url && !window.confirm(confirmationMessage)) {
                router.events.emit('routeChangeError', router.asPath, {
                    shallow: true,
                });
                // eslint-disable-next-line no-throw-literal
                throw `Route change to "${url}" was aborted (this error can be safely ignored). See https://github.com/zeit/next.js/issues/2476.`;
            }
        };

        if (unsavedChanges) {
            router.events.on('routeChangeStart', beforeRouteHandler);
        }

        return () => {
            router.events.off('routeChangeStart', beforeRouteHandler);
        };
    }, [unsavedChanges, router.events, router.asPath]);

    useEffect(() => {
        const beforeUnloadHandler = (e: BeforeUnloadEvent) => {
            (e || window.event).returnValue = '';

            return '';
        };

        if (unsavedChanges) {
            window.addEventListener('beforeunload', beforeUnloadHandler);
        }

        return () => {
            window.removeEventListener('beforeunload', beforeUnloadHandler);
        };
    }, [unsavedChanges]);
};
