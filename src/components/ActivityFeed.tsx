import styled from 'styled-components';
import { gapL, gapM, gray5 } from '@taskany/colors';

export const ActivityFeed = styled.div`
    display: grid;
    row-gap: ${gapM};
    padding-bottom: 250px;
    position: relative;
`;

export const ActivityFeedItem = styled.div`
    display: grid;
    grid-template-columns: 32px minmax(0, 1fr);
    column-gap: ${gapM};
    position: relative;

    :first-child {
        padding-top: 0px;
    }

    :first-child::before {
        content: '';
        position: absolute;
        height: ${gapL};
        left: 15px;
        top: 0;
        border-left: 1px solid ${gray5};
        z-index: 0;
        transform: translateY(-100%);
    }

    ::after {
        content: '';
        position: absolute;
        height: calc(100% + ${gapM});
        left: 15px;
        border-left: 1px solid ${gray5};
        z-index: 0;
    }

    :last-child::after {
        content: none;
    }

    &:first-child::before {
        content: none;
    }
`;
