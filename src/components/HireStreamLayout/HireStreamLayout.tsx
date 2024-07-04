import React from 'react';
import { useRouter } from 'next/router';
import { TabsMenu, TabsMenuItem } from '@taskany/bricks';
import { HireStream } from '@prisma/client';

import { Paths, generatePath } from '../../utils/paths';
import { LayoutMain } from '../LayoutMain/LayoutMain';
import { Link } from '../Link';

import { tr } from './HireStreamLayout.i18n';

interface HireStreamLayoutProps {
    children: React.ReactNode;
    hireStream: HireStream;
}

export const HireStreamLayout: React.FC<HireStreamLayoutProps> = ({ children, hireStream }) => {
    const router = useRouter();

    const hireStreamId = hireStream.id;

    const tabsMenuOptions: Array<[string, string]> = [
        [tr('Section types'), generatePath(Paths.HIRE_STREAM, { hireStreamId })],
        [tr('Roles'), generatePath(Paths.HIRE_STREAM_ROLES, { hireStreamId })],
    ];

    return (
        <LayoutMain pageTitle={hireStream.name} backlink={Paths.HIRE_STREAMS}>
            <TabsMenu>
                {tabsMenuOptions.map(([title, href]) => (
                    <Link key={href} href={href}>
                        <TabsMenuItem active={router.asPath === href}>{title}</TabsMenuItem>
                    </Link>
                ))}
            </TabsMenu>
            {children}
        </LayoutMain>
    );
};
