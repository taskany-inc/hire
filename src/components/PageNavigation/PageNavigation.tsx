import { TaskanyLogo } from '@taskany/bricks';
import {
    Navigation,
    NavigationItem,
    NavigationSection,
    NavigationSidebar,
    NavigationSidebarContent,
    NavigationSidebarHeader,
    NavigationSidebarTitle,
} from '@taskany/bricks/harmony';
import { IconBellOutline } from '@taskany/icons';
import NextLink from 'next/link';
import { UserSettings } from '@prisma/client';
import { FC } from 'react';
import { useRouter } from 'next/router';

import { useHeaderMenu } from '../../hooks/useHeaderMenu';
import { Paths } from '../../utils/paths';
import { PageNavigationActionButton } from '../PageNavigationActionButton/PageNavigationActionButton';

import s from './PageNavigation.module.css';

interface PageNavigationProps {
    userSettings?: UserSettings;
}

export const PageNavigation: FC<PageNavigationProps> = ({ userSettings }) => {
    const { asPath } = useRouter();
    const { entityListMenuItems } = useHeaderMenu(userSettings);

    return (
        <NavigationSidebar style={{ width: 200 }}>
            <NavigationSidebarHeader>
                <NextLink href={Paths.HOME}>
                    <TaskanyLogo size="m" />
                </NextLink>
                <NavigationSidebarTitle>Hire</NavigationSidebarTitle>
                <IconBellOutline size="s" />
            </NavigationSidebarHeader>
            <NavigationSidebarContent>
                <PageNavigationActionButton />
                <Navigation>
                    <NavigationSection title="">
                        {entityListMenuItems.map(({ text, path }) => (
                            <div key={path} className={s.PageNavigationItemLink}>
                                <NextLink href={path} legacyBehavior>
                                    <NavigationItem selected={asPath === path} href={path}>
                                        {text}
                                    </NavigationItem>
                                </NextLink>
                            </div>
                        ))}
                    </NavigationSection>
                </Navigation>
            </NavigationSidebarContent>
        </NavigationSidebar>
    );
};
