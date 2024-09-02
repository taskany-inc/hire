import React from 'react';
import { Select as HarmonySelect, SelectPanel, SelectTrigger, Text } from '@taskany/bricks/harmony';

interface SelectProps {
    items: { id: string; text: string }[];
    renderTrigger: React.ComponentProps<typeof SelectTrigger>['renderTrigger'];
    selectPanelClassName?: string;
    placement?: React.ComponentProps<typeof SelectPanel>['placement'];
    disabled?: boolean;

    onChange?: (selected: string) => void;
}

export const Select = ({ selectPanelClassName, disabled, onChange, items, renderTrigger, placement }: SelectProps) => {
    return (
        <HarmonySelect
            items={items.map((item) => ({ ...item, id: String(item.id) }))}
            onChange={(item) => {
                !disabled && onChange && onChange(item[0].id);
            }}
            renderItem={({ item }) => <Text size="s">{item.text}</Text>}
        >
            <SelectTrigger renderTrigger={renderTrigger} />
            <SelectPanel className={selectPanelClassName} placement={placement} />
        </HarmonySelect>
    );
};
