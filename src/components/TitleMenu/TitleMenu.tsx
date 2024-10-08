import { useState } from 'react';
import {
    Dropdown,
    DropdownPanel,
    DropdownTrigger,
    ListView,
    ListViewItem,
    MenuItem,
    Button,
} from '@taskany/bricks/harmony';
import { IconMoreVerticalSolid } from '@taskany/icons';

import s from './TitleMenu.module.css';

export interface TitleMenuItem {
    onClick: VoidFunction;
    hint?: string;
    disabled?: boolean;
    text: string;
    highlight?: boolean;
}

export interface TitleMenuProps {
    items: TitleMenuItem[];
}

export const TitleMenu = ({ items }: TitleMenuProps) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className={s.TitleMenu}>
            <Dropdown isOpen={isOpen} onClose={() => setIsOpen(false)}>
                <DropdownTrigger
                    renderTrigger={(props) => (
                        <div ref={props.ref}>
                            <Button
                                size="s"
                                view="ghost"
                                type="button"
                                onClick={() => setIsOpen(!isOpen)}
                                iconRight={<IconMoreVerticalSolid size="s" />}
                            />
                        </div>
                    )}
                />
                <DropdownPanel placement="right-start">
                    <ListView>
                        {items.map((item) => (
                            <ListViewItem
                                key={item.text}
                                value={item}
                                renderItem={({ active, hovered, ...props }) => (
                                    <MenuItem
                                        onClick={() => {
                                            setIsOpen(false);
                                            item.onClick();
                                        }}
                                        key={item.text}
                                        hovered={active || hovered}
                                        {...props}
                                    >
                                        {item.text}
                                    </MenuItem>
                                )}
                            />
                        ))}
                    </ListView>
                </DropdownPanel>
            </Dropdown>
        </div>
    );
};
