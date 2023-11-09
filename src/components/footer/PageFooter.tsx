import { FC, useState } from 'react';
import { Footer, Modal } from '@taskany/bricks';
import { FooterItem } from '@taskany/bricks/components/Footer';
import { useRouter } from 'next/router';

import FeedbackCreateForm from '../feedback/FeedbackCreateForm';
import { Link } from '../Link';
import { defaultLocale, languages } from '../../utils/getLang';
import { yearInSeconds } from '../../utils';

import { tr } from './footer.i18n';

export const PageFooter: FC = () => {
    const [openFeedbackForm, setOpenFeedbackForm] = useState(false);
    const router = useRouter();

    const { asPath, locale } = router;

    const newLocale = locale === defaultLocale ? languages[1] : defaultLocale;
    const changeLocaleTitle = locale === defaultLocale ? 'Ru' : 'En';

    const push = () => {
        document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=${yearInSeconds};SameSite=Strict`;
        router.push(asPath, asPath, { locale: newLocale });
    };

    const menuItems = [
        { title: tr('Terms'), url: '/terms' },
        { title: tr('Docs'), url: '/docs' },
        { title: tr('Contact Taskany'), url: '/contactTaskany' },
        { title: tr('API'), url: '/api' },
        { title: tr('About'), url: '/about' },
    ];

    return (
        <Footer>
            <Modal visible={openFeedbackForm} onClose={() => setOpenFeedbackForm(false)}>
                <FeedbackCreateForm onClose={() => setOpenFeedbackForm(false)} />
            </Modal>
            <Link>
                <FooterItem onClick={() => setOpenFeedbackForm(true)}>{tr('Feedback')}</FooterItem>
            </Link>

            {menuItems.map(({ title, url }) => (
                <Link key={url} href={url}>
                    <FooterItem>{title}</FooterItem>
                </Link>
            ))}

            <Link>
                <FooterItem onClick={push}>{changeLocaleTitle}</FooterItem>
            </Link>
        </Footer>
    );
};
