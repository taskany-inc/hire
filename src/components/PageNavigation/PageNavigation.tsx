import {
    ListView,
    Navigation,
    NavigationItem,
    NavigationSidebar,
    NavigationSidebarContent,
    NavigationSidebarHeader,
    NavigationSidebarTitle,
    TaskanyLogo,
} from '@taskany/bricks/harmony';
import { IconBellOutline } from '@taskany/icons';
import NextLink from 'next/link';
import { UserSettings } from '@prisma/client';
import { FC } from 'react';
import { useRouter } from 'next/router';

import { useHeaderMenu } from '../../hooks/useHeaderMenu';
import { Paths } from '../../utils/paths';
import { PageNavigationActionButton } from '../PageNavigationActionButton/PageNavigationActionButton';
import { trpc } from '../../trpc/trpcClient';

import s from './PageNavigation.module.css';

interface PageNavigationProps {
    userSettings?: UserSettings;
}

export const PageNavigation: FC<PageNavigationProps> = ({ userSettings }) => {
    const { asPath } = useRouter();
    const { entityListMenuItems } = useHeaderMenu(userSettings);
    const config = trpc.appConfig.get.useQuery(undefined, {
        staleTime: Infinity,
    });

    return (
        <NavigationSidebar className={s.PageNavigationRoot}>
            <NavigationSidebarHeader>
                <NextLink href={Paths.HOME}>
                    <TaskanyLogo src={config.data?.favicon || undefined} size="m" />
                </NextLink>
                <NavigationSidebarTitle>Hire</NavigationSidebarTitle>
                <IconBellOutline size="s" />
            </NavigationSidebarHeader>
            <NavigationSidebarContent>
                <PageNavigationActionButton />
                <Navigation className={s.PageNavigationBlock}>
                    <ListView>
                        {entityListMenuItems.map(({ text, path }) => (
                            <div key={path} className={s.PageNavigationItemLink}>
                                <NextLink href={path} legacyBehavior>
                                    <NavigationItem selected={asPath === path} href={path}>
                                        {text}
                                    </NavigationItem>
                                </NextLink>
                            </div>
                        ))}
                    </ListView>
                </Navigation>
            </NavigationSidebarContent>
        </NavigationSidebar>
    );
};
