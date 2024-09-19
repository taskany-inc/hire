import { HireStream } from '@prisma/client';
import {
    AppliedFilter,
    Text,
    Select,
    SelectPanel,
    SelectTrigger,
    TagCleanButton,
    Counter,
} from '@taskany/bricks/harmony';
import { nullable } from '@taskany/bricks';

import { tr } from './AppliedAnalyticsStreamsFilter.i18n';
import s from './AppliedAnalyticsStreamsFilter.module.css';

interface AppliedAnalyticsStreamsFilterProps {
    hireStreams: HireStream[];
    selected?: HireStream[];
    setStreams: (streams: HireStream[] | undefined) => void;
    onClearFilter: VoidFunction;
}

export const AppliedAnalyticsStreamsFilter = ({
    hireStreams,
    selected = [],
    setStreams,
    onClearFilter,
}: AppliedAnalyticsStreamsFilterProps) => {
    return (
        <AppliedFilter label={tr('Hire streams')} action={<TagCleanButton size="s" onClick={onClearFilter} />}>
            <Select
                arrow
                items={hireStreams}
                mode="multiple"
                selectable
                value={selected}
                onChange={(items) => setStreams(items)}
                renderItem={({ item }) => <Text>{item.name}</Text>}
            >
                <SelectTrigger>
                    {nullable(
                        selected.length > 1,
                        () => (
                            <Counter count={selected.length} />
                        ),
                        nullable(selected, ([{ name }]) => (
                            <Text size="s" ellipsis title={name}>
                                {name}
                            </Text>
                        )),
                    )}
                </SelectTrigger>
                <SelectPanel placement="bottom" className={s.AppliedAnalyticsStreamsFilterPanel} />
            </Select>
        </AppliedFilter>
    );
};
