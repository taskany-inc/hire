import { ReactNode, useMemo, useRef, useState } from 'react';
import NextLink from 'next/link';
import { textColor } from '@taskany/colors';
import { UserMenu, Popup, HeaderMenu } from '@taskany/bricks';
import { UserSettings } from '@prisma/client';

import { Paths } from '../../utils/paths';
import { useSession } from '../../contexts/appSettingsContext';
import { roleToLabel, UserRoles } from '../../utils/userRoles';

import s from './PageHeader.module.css';

interface PageHeaderProps {
    userSettings?: UserSettings;
    children?: ReactNode;
}

export const PageHeader = ({ userSettings, children }: PageHeaderProps) => {
    const session = useSession();
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
        <div className={s.PageHeader}>
            {children}
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
                <div color={textColor} className={s.Description}>
                    {description}
                </div>
            </Popup>
        </div>
    );
};
