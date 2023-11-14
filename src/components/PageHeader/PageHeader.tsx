import { useMemo, useRef, useState } from 'react';
import NextLink from 'next/link';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import { textColor } from '@taskany/colors';
import {
    Button,
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
import { IconUpSmallSolid, IconDownSmallSolid } from '@taskany/icons';

import { Paths } from '../../utils/paths';
import { useSession } from '../../contexts/appSettingsContext';
import { roleToLabel, UserRoles } from '../../utils/userRoles';
import { useHeaderMenu } from '../../hooks/useHeaderMenu';
import { PageHeaderLogo } from '../PageHeaderLogo';

import { tr } from './PageHeader.i18n';

const StyledDescription = styled.div`
    color: ${textColor};
    white-space: pre-wrap;
`;

const StyledHeaderNav = styled(HeaderNav)`
    display: flex;
    align-items: center;
`;

export const PageHeader: React.FC = () => {
    const { entityListMenuItems, entityCreationMenuItems } = useHeaderMenu();
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
                        <StyledDescription>{description}</StyledDescription>
                    </Popup>
                </>
            }
            nav={
                <StyledHeaderNav>
                    {entityListMenuItems.map((item, index) => (
                        <NextLink key={index + item.text} href={item.path} passHref legacyBehavior>
                            <HeaderNavLink>{item.text}</HeaderNavLink>
                        </NextLink>
                    ))}
                </StyledHeaderNav>
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
