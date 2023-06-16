import { onlineManager } from '@tanstack/react-query';
import { useEffect } from 'react';
import styled from 'styled-components';

import { useOfflineDetector } from '../utils/offline';

const StyledBanner = styled.div`
    width: 100%;
    min-height: 40px;
    max-height: 40px;
    padding-top: 10px;
    background-color: #d24b4e;
    text-align: center;
`;

export const OfflineBanner = () => {
    const { online } = useOfflineDetector();

    useEffect(() => {
        onlineManager.setOnline(online);
    }, [online]);

    return online ? null : <StyledBanner>You are currently offline. Check connection.</StyledBanner>;
};
