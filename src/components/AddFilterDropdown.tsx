import { nullable } from '@taskany/bricks';
import { Button, Select, SelectPanel, SelectTrigger, Text } from '@taskany/bricks/harmony';
import { IconAddOutline } from '@taskany/icons';

interface AddFilterDropdownProps<T> {
    items: T[];
    onChange: (value: T[]) => void;
    title?: string;
}
export const AddFilterDropdown = <T extends { id: string; title: string }>({
    items,
    onChange,
    title,
}: AddFilterDropdownProps<T>) => {
    return (
        <Select
            items={items}
            mode="single"
            onChange={onChange}
            renderItem={(props) => <Text size="s">{props.item.title}</Text>}
        >
            <SelectTrigger
                renderTrigger={(props) =>
                    nullable(Boolean(items.length), () => (
                        <Button
                            text={title}
                            iconLeft={<IconAddOutline size="xxs" />}
                            onClick={props.onClick}
                            ref={props.ref}
                        />
                    ))
                }
            />
            <SelectPanel placement="bottom" />
        </Select>
    );
};
