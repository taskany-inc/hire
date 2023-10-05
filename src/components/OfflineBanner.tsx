import { onlineManager } from '@tanstack/react-query';
import styled from 'styled-components';
import { useOfflineDetector } from '@taskany/bricks';

import { tr } from './components.i18n';

const StyledBanner = styled.div`
    width: 100%;
    min-height: 40px;
    max-height: 40px;
    padding-top: 10px;
    background-color: #d24b4e;
    text-align: center;
`;

export const OfflineBanner = () => {
    const online = useOfflineDetector({
        setStatus: (online) => onlineManager.setOnline(online),
        remoteServerUrl: '/api/health',
    });
    return online ? null : <StyledBanner>{tr('You are currently offline. Check connection.')}</StyledBanner>;
};
