import { FC, useCallback, useState } from 'react';
import { FooterCopyright, FooterMenu, Footer, FooterItem, Modal } from '@taskany/bricks/harmony';
import { useRouter } from 'next/router';

import FeedbackCreateForm from '../FeedbackCreateForm/FeedbackCreateForm';
import { Link } from '../Link';
import { defaultLocale, languages } from '../../utils/getLang';
import { useEditUserSettings } from '../../modules/userHooks';
import { trpc } from '../../trpc/trpcClient';

import { tr } from './PageFooter.i18n';

export const PageFooter: FC = () => {
    const [openFeedbackForm, setOpenFeedbackForm] = useState(false);
    const config = trpc.appConfig.get.useQuery(undefined, {
        staleTime: Infinity,
    });
    const router = useRouter();
    const { locale } = router;

    const editUserSettings = useEditUserSettings();

    const onLocaleChange = useCallback(async () => {
        const newLocale = locale === defaultLocale ? languages[1] : defaultLocale;

        return editUserSettings.mutateAsync({ locale: newLocale });
    }, [editUserSettings, locale]);

    const menuItems = [
        { title: tr('Docs'), url: config.data?.documentLink ?? undefined },
        { title: tr('Support'), url: config.data?.supportLink ?? undefined },
        { title: tr('API'), url: '/api' },
    ];

    return (
        <Footer>
            <FooterCopyright orgName="SD Hire" />
            <FooterMenu>
                <Modal visible={openFeedbackForm} onClose={() => setOpenFeedbackForm(false)}>
                    <FeedbackCreateForm onClose={() => setOpenFeedbackForm(false)} />
                </Modal>
                <FooterItem>
                    <Link>
                        <FooterItem onClick={() => setOpenFeedbackForm(true)}>{tr('Feedback')}</FooterItem>
                    </Link>
                </FooterItem>

                {menuItems.map(({ title, url }) => (
                    <Link key={url} href={url}>
                        <FooterItem>{title}</FooterItem>
                    </Link>
                ))}

                <Link>
                    <FooterItem onClick={onLocaleChange}>{tr('Locale change title')}</FooterItem>
                </Link>
            </FooterMenu>
        </Footer>
    );
};
