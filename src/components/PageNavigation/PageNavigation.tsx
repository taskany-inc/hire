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
import { FC } from 'react';
import { useRouter } from 'next/router';

import { Link } from '../Link';
import { useSidebarMenu } from '../../hooks/useSidebarMenu';
import { Paths } from '../../utils/paths';
import { PageNavigationActionButton } from '../PageNavigationActionButton/PageNavigationActionButton';
import { trpc } from '../../trpc/trpcClient';

import s from './PageNavigation.module.css';

export const PageNavigation: FC = () => {
    const { asPath } = useRouter();
    const { entityListMenuItems } = useSidebarMenu();
    const config = trpc.appConfig.get.useQuery(undefined, {
        staleTime: Infinity,
    });

    return (
        <NavigationSidebar className={s.PageNavigationRoot}>
            <NavigationSidebarHeader>
                <Link href={Paths.HOME}>
                    <TaskanyLogo src={config.data?.favicon || undefined} size="m" />
                </Link>
                <NavigationSidebarTitle>Hire</NavigationSidebarTitle>
                <IconBellOutline size="s" />
            </NavigationSidebarHeader>
            <NavigationSidebarContent>
                <PageNavigationActionButton />
                <Navigation className={s.PageNavigationBlock}>
                    <ListView>
                        {entityListMenuItems.map(({ text, path }) => (
                            <Link key={path} href={path} className={s.PageNavigationItemLink}>
                                <NavigationItem selected={asPath === path} value={path}>
                                    {text}
                                </NavigationItem>
                            </Link>
                        ))}
                    </ListView>
                </Navigation>
            </NavigationSidebarContent>
        </NavigationSidebar>
    );
};
