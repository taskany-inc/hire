import { Dropdown, MenuItem, MoreVerticalIcon } from '@taskany/bricks';

import { DropdownMenuItem } from '../TagFilterDropdown';
import { IconButton } from '../IconButton';

export interface TitleMenuProps {
    items: DropdownMenuItem[];
}

export const TitleMenu = ({ items }: TitleMenuProps) => {
    return (
        <div style={{ display: 'inline-block' }}>
            <Dropdown
                items={items}
                renderTrigger={(props) => (
                    <IconButton ref={props.ref} onClick={props.onClick}>
                        <MoreVerticalIcon size="s" />
                    </IconButton>
                )}
                renderItem={({ cursor, item, index }) => (
                    <MenuItem
                        key={item.text}
                        focused={cursor === index}
                        onClick={item.disabled ? undefined : item.onClick}
                        view="primary"
                        ghost
                    >
                        {item.text}
                    </MenuItem>
                )}
            />
        </div>
    );
};
