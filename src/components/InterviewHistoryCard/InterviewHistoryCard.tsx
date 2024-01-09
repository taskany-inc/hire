import { VFC } from 'react';
import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer-continued';
import styled from 'styled-components';
import { gray5, gray9 } from '@taskany/colors';
import { Text } from '@taskany/bricks';

import {
    InterviewEventLabels,
    InterviewEventTypes,
    InterviewEventWithRelations,
} from '../../modules/interviewEventTypes';
import { isSomeEnum } from '../../utils/typeGuards';
import { useToggle } from '../../hooks/useToggle';
import { UserAvatar } from '../UserAvatar';
import { useDistanceDate } from '../../hooks/useDateFormat';

import { tr } from './InterviewHistoryCard.i18n';

type InterviewHistoryCardProps = {
    interviewChangeEvent: InterviewEventWithRelations;
};

const Card = styled.div`
    border: solid 1px ${gray9};
    margin-bottom: 10px;
    border-radius: 4px;
    padding: 20px;
    background-color: ${gray5};
`;

const CardTitleContainer = styled.div`
    display: flex;
    align-items: center;
`;

const ChangeEventLabel = styled(Text)`
    margin-left: 8px;
    font-weight: bold;
`;

const VisibleContainer = styled.div`
    margin-right: 20px;
    margin-left: auto;
    cursor: pointer;
    display: flex;
    align-items: center;
`;

const Content = styled.div`
    margin-top: 20px;
`;

const StyledText = styled(Text)`
    display: inline-block;
`;

export const InterviewHistoryCard: VFC<InterviewHistoryCardProps> = ({ interviewChangeEvent }) => {
    const { user, type, createdAt, before, after } = interviewChangeEvent;
    const [isVisible, toggle] = useToggle(false);
    const [sideBySide, toggleSide] = useToggle(true);
    const date = useDistanceDate(createdAt);

    const beforeData = JSON.stringify(JSON.parse(`${before}`), null, 4);
    const afterData = JSON.stringify(JSON.parse(`${after}`), null, 4);
    const changeEventLabel = isSomeEnum(InterviewEventTypes, type) && InterviewEventLabels[InterviewEventTypes[type]];

    return (
        <Card>
            <CardTitleContainer>
                <UserAvatar user={user} />

                <ChangeEventLabel>
                    {changeEventLabel} - {date}
                </ChangeEventLabel>
                <VisibleContainer>
                    <label htmlFor={`${interviewChangeEvent.id}isVisible`}>
                        <input
                            id={`${interviewChangeEvent.id}isVisible`}
                            type="checkbox"
                            checked={isVisible}
                            onChange={toggle}
                            color="primary"
                        />
                        <StyledText>{tr('Show')}</StyledText>
                    </label>

                    <label htmlFor={`${interviewChangeEvent.id}sideBySide`}>
                        <input
                            id={`${interviewChangeEvent.id}sideBySide`}
                            type="checkbox"
                            checked={sideBySide}
                            onChange={toggleSide}
                            color="primary"
                            disabled={!isVisible}
                        />
                        <StyledText>{tr('Side to side')}</StyledText>
                    </label>
                </VisibleContainer>
            </CardTitleContainer>
            {isVisible && (
                <Content>
                    <ReactDiffViewer
                        oldValue={beforeData}
                        newValue={afterData}
                        extraLinesSurroundingDiff={2}
                        compareMethod={DiffMethod.LINES}
                        splitView={sideBySide}
                        useDarkTheme
                        hideLineNumbers
                    />
                </Content>
            )}
        </Card>
    );
};
