import { ComponentProps, useMemo, useRef, useState } from 'react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import {
    Dropdown,
    Header,
    HeaderContent,
    HeaderLogo,
    HeaderNav,
    HeaderNavLink,
    MenuItem,
    HeaderMenu,
    UserMenu,
    Popup,
} from '@taskany/bricks';
import { UserSettings } from '@prisma/client';
import { IconUpSmallSolid, IconDownSmallSolid } from '@taskany/icons';
import { Button } from '@taskany/bricks/harmony';

import { Paths } from '../../utils/paths';
import { useSession } from '../../contexts/appSettingsContext';
import { roleToLabel, UserRoles } from '../../utils/userRoles';
import { useHeaderMenu } from '../../hooks/useHeaderMenu';
import { PageHeaderLogo } from '../PageHeaderLogo';

import { tr } from './PageHeader.i18n';
import s from './PageHeader.module.css';

export const PageHeader: React.FC<{
    logo?: ComponentProps<typeof PageHeaderLogo>['logo'];
    userSettings?: UserSettings;
}> = ({ logo, userSettings }) => {
    const { entityListMenuItems, entityCreationMenuItems } = useHeaderMenu(userSettings);
    const router = useRouter();
    const session = useSession();
    const onMenuItemClick = ({ path }: { path: string }) => router.push(path);
    const [popupVisible, setPopupVisibility] = useState(false);
    const popupRef = useRef<HTMLDivElement>(null);

    const description = useMemo(() => {
        const user = session?.user;
        const userRoles = session?.userRoles;

        if (!user || !userRoles) {
            return '';
        }

        const roles: string[] = [];

        if (userRoles.admin) {
            roles.push(roleToLabel(UserRoles.ADMIN));
        }

        if (userRoles.hireStreamManager.length > 0) {
            const streamNames = userRoles.hireStreamManager.map((stream) => stream.name).join(', ');
            roles.push(`${roleToLabel(UserRoles.HIRE_STREAM_MANAGER)} [${streamNames}]`);
        }

        if (userRoles.hiringLead.length > 0) {
            const streamNames = userRoles.hiringLead.map((stream) => stream.name).join(', ');
            roles.push(`${roleToLabel(UserRoles.HIRING_LEAD)} [${streamNames}]`);
        }

        if (userRoles.recruiter.length > 0) {
            const streamNames = userRoles.recruiter.map((stream) => stream.name).join(', ');
            roles.push(`${roleToLabel(UserRoles.RECRUITER)} [${streamNames}]`);
        }

        if (userRoles.interviewer.length > 0) {
            const sectionTypeNames = userRoles.interviewer
                .map((sectionType) => `${sectionType.title} (${sectionType.hireStream.name})`)
                .join(', ');
            roles.push(`${roleToLabel(UserRoles.INTERVIEWER)} [${sectionTypeNames}]`);
        }

        return `${user.name}\n${roles.join('\n')}`;
    }, [session, userSettings]);

    return (
        <Header
            logo={
                <HeaderLogo>
                    <PageHeaderLogo logo={logo} />
                </HeaderLogo>
            }
            menu={
                <>
                    <HeaderMenu>
                        <div
                            ref={popupRef}
                            onMouseEnter={() => setPopupVisibility(true)}
                            onMouseLeave={() => setPopupVisibility(false)}
                        >
                            <NextLink href={Paths.USERS_SETTINGS}>
                                <UserMenu email={session?.user.email} name={session?.user.name} />
                            </NextLink>
                        </div>
                    </HeaderMenu>

                    <Popup
                        tooltip
                        placement="bottom-end"
                        maxWidth={300}
                        arrow={false}
                        reference={popupRef}
                        visible={popupVisible}
                    >
                        <div className={s.PageHeaderDescription}>{description}</div>
                    </Popup>
                </>
            }
            nav={
                <HeaderNav className={s.PageHeaderNav}>
                    {entityListMenuItems.map((item, index) => (
                        <NextLink key={index + item.text} href={item.path} passHref legacyBehavior>
                            <HeaderNavLink>{item.text}</HeaderNavLink>
                        </NextLink>
                    ))}
                </HeaderNav>
            }
        >
            <HeaderContent>
                <Button
                    text={tr('Create')}
                    view="primary"
                    brick="right"
                    onClick={() => router.push(Paths.PROBLEMS_NEW)}
                />
                <Dropdown
                    onChange={onMenuItemClick}
                    items={entityCreationMenuItems}
                    renderTrigger={(props) => (
                        <Button
                            view="primary"
                            brick="left"
                            iconRight={props.visible ? <IconUpSmallSolid size="s" /> : <IconDownSmallSolid size="s" />}
                            ref={props.ref}
                            onClick={props.onClick}
                        />
                    )}
                    renderItem={(props) => (
                        <MenuItem
                            key={props.item.text}
                            focused={props.cursor === props.index}
                            onClick={props.onClick}
                            view="primary"
                            ghost
                        >
                            {props.item.text}
                        </MenuItem>
                    )}
                />
            </HeaderContent>
        </Header>
    );
};
