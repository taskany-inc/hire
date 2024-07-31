import { FC, useState } from 'react';
import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer-continued';
import styled from 'styled-components';
import { gapM, gapSm, gapXs, gray9 } from '@taskany/colors';
import { Text, nullable } from '@taskany/bricks';
import { IconDividerLineOutline } from '@taskany/icons';
import { Button } from '@taskany/bricks/harmony';

import { UserAvatar } from '../UserAvatar';
import { ProblemHistoryWithUser } from '../../modules/problemTypes';
import { HistoryTagsAndDifficultyTextChange } from '../HistoryTagsAndDifficultyTextChange/HistoryTagsAndDifficultyTextChange';
import { useDistanceDate } from '../../hooks/useDateFormat';

interface ProblemHistoryCardProps {
    problemHistoryChangeEvent: ProblemHistoryWithUser;
}

const Card = styled.div`
    display: grid;
    grid-template-column: 7fr 5fr;
    gap: ${gapM};
    flex: 1;
    line-height: 1.5;
    align-items: flex-start;
    flex-wrap: nowrap;
    max-width: 1000px;
`;

const CardTitleContainer = styled.div`
    display: inline-flex;
    flex-wrap: wrap;
    align-items: start;
    margin-top: ${gapSm};
    gap: 1rem;
    flex: 1;
`;

const VisibleContainer = styled.div`
    cursor: pointer;
`;

const Content = styled.div`
    padding-top: ${gapXs};
`;

const newStyles = {
    variables: {
        dark: {
            diffViewerBackground: '#1e1e24',
            diffViewerColor: '#babac5',
            addedBackground: '#213517',
            addedColor: '#7cb663',
            removedBackground: '#452221',
            removedColor: '#f2a4a1',
            codeFoldBackground: '#25252c',
            emptyLineBackground: '#25252c',
            codeFoldGutterBackground: '#1e1e24',
            codeFoldContentColor: '#E3E3E8',
            gutterColor: '#babac5',
            wordAddedBackground: '#213517',
            wordRemovedBackground: '#452221',
            addedGutterBackground: '#7CB663',
            removedGutterColor: '#7CB663',
        },
        line: {
            textDecoration: 'none',
        },
    },
};

export const ProblemHistoryCard: FC<ProblemHistoryCardProps> = ({ problemHistoryChangeEvent }) => {
    const { user, subject, createdAt, previousValue, nextValue } = problemHistoryChangeEvent;
    const [viewProblemHistoryDescription, setViewProblemHistoryDescription] = useState(false);
    const date = useDistanceDate(createdAt);

    const beforeData = JSON.parse(JSON.stringify(previousValue, null, 4));
    const afterData = JSON.parse(JSON.stringify(nextValue, null, 4));

    const handlerViewProblemHistoryDescription = () => {
        setViewProblemHistoryDescription(!viewProblemHistoryDescription);
    };

    return (
        <Card>
            <CardTitleContainer>
                <UserAvatar user={user} />

                <Content>
                    <Text size="m" color={gray9}>
                        changed {subject} {date}
                    </Text>
                </Content>

                <VisibleContainer>
                    <Button
                        view={!viewProblemHistoryDescription ? 'ghost' : 'default'}
                        iconRight={<IconDividerLineOutline size="xs" />}
                        onClick={handlerViewProblemHistoryDescription}
                    />
                </VisibleContainer>
            </CardTitleContainer>
            {nullable(viewProblemHistoryDescription, () =>
                subject === 'tags' || subject === 'difficulty' ? (
                    <HistoryTagsAndDifficultyTextChange from={beforeData} to={afterData} />
                ) : (
                    <Content>
                        <ReactDiffViewer
                            oldValue={beforeData}
                            newValue={afterData}
                            extraLinesSurroundingDiff={2}
                            compareMethod={DiffMethod.LINES}
                            hideLineNumbers
                            splitView={false}
                            useDarkTheme
                            styles={newStyles}
                        />
                    </Content>
                ),
            )}
        </Card>
    );
};
