import { FC, useState } from 'react';
import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer-continued';
import { gray9 } from '@taskany/colors';
import { Text, nullable } from '@taskany/bricks';
import { IconDividerLineOutline } from '@taskany/icons';
import { Button, User } from '@taskany/bricks/harmony';

import { ProblemHistoryWithUser } from '../../modules/problemTypes';
import { useDistanceDate } from '../../hooks/useDateFormat';
import { ArchivedChange } from '../ArchivedChange/ArchivedChange';
import { PlainTextChange } from '../PlainTextChange/PlainTextChange';

import s from './ProblemHistoryCard.module.css';

interface ProblemHistoryCardProps {
    problemHistoryChangeEvent: ProblemHistoryWithUser;
}

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
        <div className={s.ProblemHistoryCard}>
            <div className={s.ProblemHistoryCardTitleContainer}>
                <User name={user.name} email={user.email} />

                <div className={s.ProblemHistoryCardContent}>
                    <Text size="m" color={gray9}>
                        changed {subject} {date}
                    </Text>
                </div>

                <div className={s.ProblemHistoryCardVisibleContainer}>
                    <Button
                        view={!viewProblemHistoryDescription ? 'ghost' : 'default'}
                        iconRight={<IconDividerLineOutline size="xs" />}
                        onClick={handlerViewProblemHistoryDescription}
                    />
                </div>
            </div>
            {nullable(viewProblemHistoryDescription && (subject === 'tags' || subject === 'difficulty'), () => (
                <PlainTextChange from={beforeData} to={afterData} />
            ))}
            {nullable(viewProblemHistoryDescription && subject === 'archived', () => (
                <ArchivedChange from={beforeData} to={afterData} />
            ))}
            {nullable(
                viewProblemHistoryDescription &&
                    !(subject === 'tags' || subject === 'difficulty' || subject === 'archived'),
                () => (
                    <div className={s.ProblemHistoryCardContent}>
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
                    </div>
                ),
            )}
        </div>
    );
};
