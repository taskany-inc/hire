import { HeaderMenu, nullable, Popup, UserMenu } from '@taskany/bricks';
import NextLink from 'next/link';
import React, { useRef, useState } from 'react';

import { Paths } from '../../utils/paths';
import { useSession } from '../../contexts/appSettingsContext';
import { UserRolesDescription } from '../UserRolesDescription/UserRolesDescription';

import s from './HeaderUserMenu.module.css';

export const HeaderUserMenu = () => {
    const session = useSession();
    const [popupVisible, setPopupVisibility] = useState(false);
    const popupRef = useRef<HTMLDivElement>(null);

    return (
        <>
            <HeaderMenu className={s.PageHeaderUserPopup}>
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
                {nullable(session, ({ user, userRoles }) => (
                    <UserRolesDescription name={user.name || user.email} roles={userRoles} />
                ))}
            </Popup>
        </>
    );
};
