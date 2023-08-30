import { VFC } from 'react';
import { Text, Badge } from '@taskany/bricks';
import { IconStarSolid } from '@taskany/icons';

import { TagChip } from '../problems/TagChip';
import { tagPalette, TagPaletteColor } from '../../utils/tag-palette';
import { Stack } from '../layout/Stack';
import { InlineDot } from '../InlineDot';

import { Card } from './Card';
import { CardHeader } from './CardHeader';
import { CardFooter } from './CardFooter';
import { CardContent } from './CardContent';

export const CardExamples: VFC = () => {
    return (
        <Stack direction="column" gap={4}>
            <Card>
                <CardHeader
                    title="Card with random chips and link"
                    link="/"
                    chips={['one', 'two', 'anything'].map((item, i) => (
                        <Badge key={item} color={tagPalette[i]}>
                            {item}
                        </Badge>
                    ))}
                />
            </Card>

            <Card>
                <CardHeader
                    title="Card with a beautiful subtitle and tags"
                    subTitle={
                        <>
                            23.11.2021
                            <InlineDot />
                            Added by <Text size="s">Vadim</Text>
                        </>
                    }
                    chips={
                        <>
                            <TagChip tag={{ id: 1, name: 'JS' }} />
                            <TagChip tag={{ id: 2, name: 'TS' }} />
                        </>
                    }
                />
            </Card>

            <Card>
                <CardHeader
                    title="Card with body and footer"
                    subTitle="Simple subtitle"
                    chips={<Badge color={TagPaletteColor.CYAN}>HIRE</Badge>}
                />
                <CardContent>
                    There are many variations of passages of Lorem Ipsum available, but the majority have suffered
                    alteration in some form, by injected humour, or randomised words which dont look even slightly
                    believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isnt
                    anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet
                    tend to repeat predefined chunks as necessary, making this the first true generator on the Internet.
                    It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures,
                    to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is therefore always free
                    from repetition, injected humour, or non-characteristic words etc.
                    <Text color="textSecondary" style={{ marginTop: 4 }}>
                        Employment: <Text as="span">Globus IT</Text>
                    </Text>
                    <Text color="textSecondary">Email: someemail@mail.mail</Text>
                </CardContent>
                <CardFooter>
                    Difficulty: high
                    <InlineDot />
                    12 solutions
                    <InlineDot />
                    40 attempts
                </CardFooter>
            </Card>

            <Card action={<IconStarSolid size="m" />}>
                <CardHeader title="Action card" />
                <CardContent>Content</CardContent>
                <CardFooter>Footer</CardFooter>
            </Card>
        </Stack>
    );
};
