import { FC, useState } from 'react';
import { Footer, Modal } from '@taskany/bricks';
import { FooterItem } from '@taskany/bricks/components/Footer';
import { gray9 } from '@taskany/colors';

import FeedbackCreateForm from '../feedback/FeedbackCreateForm';
import { Link } from '../Link';

import { tr } from './footer.i18n';

export const PageFooter: FC = () => {
    const [openFeedbackForm, setOpenFeedbackForm] = useState(false);

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
                <FooterItem color={gray9} onClick={() => setOpenFeedbackForm(true)}>
                    {tr('Feedback')}
                </FooterItem>
            </Link>

            {menuItems.map(({ title, url }) => (
                <Link key={url} href={url}>
                    <FooterItem color={gray9}>{title}</FooterItem>
                </Link>
            ))}
        </Footer>
    );
};
