import { ModalContent, ModalHeader, ModalPreview, nullable } from '@taskany/bricks';
import { useCallback, useEffect, useState } from 'react';
import cn from 'classnames';
import { Button } from '@taskany/bricks/harmony';

import { trpc } from '../../trpc/trpcClient';
import { useLocale } from '../../hooks/useLocale';

import { tr } from './WhatsNew.i18n';
import s from './WhatsNew.module.css';

export const WhatsNew = () => {
    const locale = useLocale();
    const [iframeReady, setIframeReady] = useState(false);
    const [open, setOpen] = useState(false);

    const { data } = trpc.whatsnew.check.useQuery(
        {
            locale,
        },
        { staleTime: Infinity },
    );

    useEffect(() => {
        if (data?.releaseNotesExists && data?.version && !data?.read && !data?.delayed) {
            setOpen(true);
        }
    }, [data]);

    const onIframeLoad = useCallback(() => {
        setIframeReady(true);
    }, []);

    const markAsReadMutation = trpc.whatsnew.markAsRead.useMutation();
    const onReadClick = useCallback(async () => {
        if (data?.version) {
            await markAsReadMutation.mutateAsync({
                version: data.version,
            });

            setOpen(false);
        }
    }, [markAsReadMutation, data]);

    const markAsDelayedMutation = trpc.whatsnew.markAsDelayed.useMutation();
    const onDelayClick = useCallback(async () => {
        if (data?.version) {
            await markAsDelayedMutation.mutateAsync({
                version: data.version,
            });

            setOpen(false);
        }
    }, [markAsDelayedMutation, data]);

    return (
        <ModalPreview visible={open} onClose={onDelayClick}>
            <ModalHeader>{tr("What's New!")}</ModalHeader>
            <ModalContent>
                {nullable(data?.version, (v) => (
                    <iframe
                        className={cn(s.WhatsNewIframe, { [s.WhatsNewIframe_visible]: iframeReady })}
                        src={`/whatsnew/${v}/${locale}`}
                        onLoad={onIframeLoad}
                    />
                ))}

                <div className={s.WhatsNewFooter}>
                    <Button text={tr('Dismiss')} onClick={onDelayClick} />
                    <Button view="primary" text={tr('Awesome! Thank you!')} onClick={onReadClick} />
                </div>
            </ModalContent>
        </ModalPreview>
    );
};
