import { SectionType } from '@prisma/client';
import { useRouter } from 'next/router';
import { Dropdown, Button, MoreVerticalIcon } from '@taskany/bricks';

import { pageHrefs } from '../../utils/paths';
import { ColorizedMenuItem } from '../ColorizedMenuItem';

import { tr } from './sections.i18n';

interface Props {
    interviewId: number;
    sectionTypes: SectionType[];
}

// TODO: disable return value linting
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function AssignSectionDropdownButton({ interviewId, sectionTypes }: Props) {
    const router = useRouter();
    const onSectionTypeClick = (sectionType: SectionType) =>
        router.push(pageHrefs.interviewSectionCreate(interviewId, sectionType.id, sectionType.schedulable));

    return (
        <Dropdown
            onChange={onSectionTypeClick}
            items={sectionTypes}
            renderTrigger={(props) => (
                <Button
                    view="primary"
                    iconRight={<MoreVerticalIcon size="s" />}
                    onClick={props.onClick}
                    text={tr('Assign section')}
                />
            )}
            renderItem={(props) => (
                <ColorizedMenuItem
                    key={props.item.id}
                    title={props.item.title}
                    onClick={props.onClick}
                    hoverColor="#565589"
                />
            )}
        />
    );
}
