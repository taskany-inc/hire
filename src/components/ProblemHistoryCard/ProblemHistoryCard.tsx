import { FC, useState } from 'react';
import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer-continued';
import styled from 'styled-components';
import { gapM, gapS, gapSm, gapXs, gray9 } from '@taskany/colors';
import { Button, Text, nullable } from '@taskany/bricks';
import { IconDividerLineOutline } from '@taskany/icons';

import { distanceDate } from '../../utils/date';
import { UserAvatar } from '../UserAvatar';
import { ProblemHistoryWithUser } from '../../modules/problemTypes';
import { HistoryTagsAndDifficultyTextChange } from '../HistoryTagsAndDifficultyTextChange/HistoryTagsAndDifficultyTextChange';

type ProblemHistoryCardProps = {
    problemHistoryChangeEvent: ProblemHistoryWithUser;
};

const Card = styled.div`
    margin: 0 ${gapM} 0 0;
    border-radius: 4px;
    padding: ${gapSm} 0 ${gapSm} 0;
    max-width: 100%;
`;

const CardTitleContainer = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: ${gapSm};
    margin-left: 0;
    gap: ${gapS};
`;

const VisibleContainer = styled.div`
    margin-right: ${gapXs};
    margin-left: auto;
    cursor: pointer;
    display: flex;
    align-items: center;
`;

const Content = styled.div`
    margin-top: ${gapSm};
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

    const beforeData = JSON.parse(JSON.stringify(previousValue, null, 4));
    const afterData = JSON.parse(JSON.stringify(nextValue, null, 4));

    const handlerViewProblemHistoryDescription = () => {
        setViewProblemHistoryDescription(!viewProblemHistoryDescription);
    };

    return (
        <Card>
            <CardTitleContainer>
                <UserAvatar user={user} />

                <Text size="m" color={gray9}>
                    changed {subject} {distanceDate(createdAt)}
                </Text>

                <VisibleContainer>
                    <Button
                        ghost={!viewProblemHistoryDescription}
                        outline={viewProblemHistoryDescription}
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
