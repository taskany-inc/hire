import * as Sentry from '@sentry/nextjs';

import { LayoutMain } from '../components/LayoutMain/LayoutMain';

export interface ErrorProps {
    statusCode: number;
    message: string;
}

export default function Custom404() {
    return (
        <Sentry.ErrorBoundary fallback={<p>404 on hire</p>}>
            <LayoutMain pageTitle="Nothing found 😔" />
        </Sentry.ErrorBoundary>
    );
}
