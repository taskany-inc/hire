import { SectionType } from '@prisma/client';
import { useRouter } from 'next/router';
import { IconMoreVerticalSolid } from '@taskany/icons';
import {
    Button,
    DropdownTrigger,
    Dropdown,
    DropdownPanel,
    ListView,
    ListViewItem,
    MenuItem,
} from '@taskany/bricks/harmony';
import { useState } from 'react';

import { pageHrefs } from '../../utils/paths';

import { tr } from './AssignSectionDropdownButton.i18n';

interface Props {
    interviewId: number;
    sectionTypes: SectionType[];
}

// TODO: disable return value linting
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function AssignSectionDropdownButton({ interviewId, sectionTypes }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();
    const onSectionTypeClick = (sectionType: SectionType) =>
        router.push(pageHrefs.interviewSectionCreate(interviewId, sectionType.id, sectionType.schedulable));

    return (
        <Dropdown isOpen={isOpen} onClose={() => setIsOpen(false)}>
            <DropdownTrigger
                renderTrigger={(props) => (
                    <div ref={props.ref}>
                        <Button
                            text={tr('Assign section')}
                            view="primary"
                            type="button"
                            onClick={() => setIsOpen(!isOpen)}
                            iconRight={<IconMoreVerticalSolid size="s" />}
                        />
                    </div>
                )}
            />
            <DropdownPanel>
                <ListView>
                    {sectionTypes.map((item) => (
                        <ListViewItem
                            key={item.title}
                            value={item}
                            renderItem={({ active, hovered, ...props }) => (
                                <MenuItem
                                    onClick={() => {
                                        setIsOpen(false);
                                        onSectionTypeClick(item);
                                    }}
                                    key={item.title}
                                    hovered={active || hovered}
                                    {...props}
                                >
                                    {item.title}
                                </MenuItem>
                            )}
                        />
                    ))}
                </ListView>
            </DropdownPanel>
        </Dropdown>
    );
}
