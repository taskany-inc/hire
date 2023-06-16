import { useCallback } from 'react';
import { useSnackbar } from 'notistack';
import { TRPCClientError } from '@trpc/client';
import { typeToFlattenedError } from 'zod';
import { CrossIcon } from '@taskany/bricks';

import { isAxiosError, isObject } from '../utils/type-guards';
import { IconButton } from '../components/IconButton';

export const useNotifications = () => {
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    const enqueueSuccessNotification = useCallback(
        (message: string) => {
            enqueueSnackbar(message, { variant: 'success' });
        },
        [enqueueSnackbar],
    );

    const enqueueValidErrorNotification = useCallback(
        (message: string) => {
            enqueueSnackbar(message, {
                variant: 'error',
                action: (key) => (
                    <IconButton onClick={() => closeSnackbar(key)}>
                        <CrossIcon size="s" />
                    </IconButton>
                ),
            });
        },
        [enqueueSnackbar, closeSnackbar],
    );

    const enqueueErrorNotification = useCallback(
        (error: unknown) => {
            let message = 'Unexpected error';

            if (isAxiosError(error) && isObject(error.response) && typeof error.response.data === 'string') {
                message = error.response.data;
            }

            if (error instanceof TRPCClientError) {
                if (error.data?.zodError) {
                    const flat: typeToFlattenedError<any, string> = error.data.zodError;
                    const formErrors = flat.formErrors.join('\n');
                    const fieldErrors = Object.entries(flat.fieldErrors)
                        .map(([k, v]) => {
                            return `${k}: ${v?.join(',')}`;
                        })
                        .join('\n');
                    message = `${formErrors}\n${fieldErrors}`.trim();
                } else {
                    message = error.message;
                }
            }
            enqueueSnackbar(message, {
                variant: 'error',
                persist: true,
                action: (key) => (
                    <IconButton onClick={() => closeSnackbar(key)}>
                        <CrossIcon size="s" />
                    </IconButton>
                ),
            });
        },
        [enqueueSnackbar, closeSnackbar],
    );

    return { enqueueSuccessNotification, enqueueErrorNotification, enqueueValidErrorNotification };
};
