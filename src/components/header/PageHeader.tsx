import { useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { textColor, gapXl, gapXs } from '@taskany/colors';
import {
    Button,
    Dropdown,
    Header,
    HeaderContent,
    HeaderLogo,
    HeaderNav,
    HeaderNavLink,
    MenuItem,
    ArrowUpSmallIcon,
    ArrowDownSmallIcon,
    UserPic,
} from '@taskany/bricks';

import { Paths } from '../../utils/paths';
import { useSession } from '../../contexts/app-settings-context';
import { roleToLabel, UserRoles } from '../../backend/user-roles';

import { useHeaderMenu } from './useHeaderMenu';
import { PageHeaderLogo } from './PageHeaderLogo';

import { tr } from './header.i18n';

const Popup = dynamic(() => import('@taskany/bricks/components/Popup'));

const StyledNav = styled(HeaderNav)`
    margin-left: ${gapXl};
`;

const StyledAvatar = styled.div`
    padding-left: ${gapXs};
`;

const StyledDescription = styled.div`
    color: ${textColor};
    white-space: pre-wrap;
`;

export const PageHeader: React.FC = () => {
    const { entityListMenuItems, entityCreationMenuItems } = useHeaderMenu();
    const router = useRouter();
    const session = useSession();
    const onMenuItemClick = ({ path }: { path: string }) => router.push(path);
    const [popupVisible, setPopupVisibility] = useState(false);
    const popupRef = useRef<HTMLDivElement>(null);

    const avatarSrc = session?.user?.email;

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
    }, [session]);

    return (
        <Header
            logo={
                <HeaderLogo>
                    <PageHeaderLogo />
                </HeaderLogo>
            }
            menu={
                <>
                    <StyledAvatar
                        ref={popupRef}
                        onMouseEnter={() => setPopupVisibility(true)}
                        onMouseLeave={() => setPopupVisibility(false)}
                    >
                        <UserPic size={32} email={avatarSrc} />
                    </StyledAvatar>
                    <Popup
                        tooltip
                        placement="bottom-end"
                        maxWidth={300}
                        arrow={false}
                        reference={popupRef}
                        visible={popupVisible}
                    >
                        <StyledDescription>{description}</StyledDescription>
                    </Popup>
                </>
            }
            nav={
                <StyledNav>
                    <HeaderNav>
                        {entityListMenuItems.map((item, index) => (
                            // <NextLink>
                            <HeaderNavLink key={index + item.text} href={item.path}>
                                {item.text}
                            </HeaderNavLink>
                            // </NextLink>
                        ))}
                    </HeaderNav>
                </StyledNav>
            }
        >
            <HeaderContent>
                <Button
                    text={tr('Create')}
                    view="primary"
                    outline
                    brick="right"
                    onClick={() => router.push(Paths.PROBLEMS_NEW)}
                />
                <Dropdown
                    onChange={onMenuItemClick}
                    items={entityCreationMenuItems}
                    renderTrigger={(props) => (
                        <Button
                            view="primary"
                            outline
                            brick="left"
                            iconRight={
                                props.visible ? (
                                    <ArrowUpSmallIcon size="s" noWrap />
                                ) : (
                                    <ArrowDownSmallIcon size="s" noWrap />
                                )
                            }
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
