import * as Sentry from '@sentry/nextjs';
import type { NextPage, NextPageContext } from 'next';

import { LayoutMain } from '../components/LayoutMain/LayoutMain';

export interface ErrorProps {
    statusCode: number;
    message: string;
}

const CustomErrorComponent: NextPage<ErrorProps> = ({ message }: ErrorProps) => {
    return (
        <Sentry.ErrorBoundary fallback={<p>{message}</p>}>
            <LayoutMain pageTitle={message} />
        </Sentry.ErrorBoundary>
    );
};

CustomErrorComponent.getInitialProps = ({ err, res }: NextPageContext) => {
    const message = err?.message || 'Unexpected error';

    let statusCode = err?.statusCode || 404;

    if (!err && res) statusCode = res.statusCode;

    return { statusCode, message };
};

export default CustomErrorComponent;
