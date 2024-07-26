import { FC } from 'react';
import { IconUpSmallSolid, IconDownSmallSolid } from '@taskany/icons';
import { useRouter } from 'next/router';
import { Button, Text } from '@taskany/bricks/harmony';
import { UserSettings } from '@prisma/client';

import { Paths } from '../../utils/paths';
import { Dropdown, DropdownPanel, DropdownTrigger } from '../Dropdown/Dropdown';
import { useHeaderMenu } from '../../hooks/useHeaderMenu';

import s from './PageNavigationActionButton.module.css';
import { tr } from './PageNavigationActionButton.i18n';

interface PageNavigationActionButtonProps {
    userSettings?: UserSettings;
}

export const PageNavigationActionButton: FC<PageNavigationActionButtonProps> = ({ userSettings }) => {
    const router = useRouter();
    const { entityCreationMenuItems } = useHeaderMenu(userSettings);
    const onMenuItemClick = ({ id }: { id: string }) => router.push(id);

    return (
        <div className={s.NavigationSidebarActionButton}>
            <Button
                className={s.NavigationSidebarActionButtonDefault}
                text={tr('Create')}
                brick="right"
                onClick={() => router.push(Paths.PROBLEMS_NEW)}
            />
            <Dropdown>
                <DropdownTrigger
                    renderTrigger={(props) => (
                        <Button
                            brick="left"
                            iconRight={props.isOpen ? <IconUpSmallSolid size="s" /> : <IconDownSmallSolid size="s" />}
                            ref={props.ref}
                            onClick={props.onClick}
                        />
                    )}
                />
                <DropdownPanel
                    placement="bottom-end"
                    items={entityCreationMenuItems.map(({ path, text }) => ({ id: path, title: text }))}
                    mode="single"
                    onChange={onMenuItemClick}
                    renderItem={(props) => (
                        <Text size="s" onClick={() => onMenuItemClick(props.item)}>
                            {props.item.title}
                        </Text>
                    )}
                />
            </Dropdown>
        </div>
    );
};
