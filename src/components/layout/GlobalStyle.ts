/* stylelint-disable */
import { createGlobalStyle } from 'styled-components';
import { backgroundColor, fontDisplay, textColor } from '@taskany/colors';

// TODO color-scheme as in users settings after https://github.com/taskany-inc/hire/issues/191

export const GlobalStyle = createGlobalStyle`
    html, body {
        color-scheme: dark;
        box-sizing: border-box;

        font-family: ${fontDisplay};
        color: ${textColor};

        margin: 0;
        padding: 0;

        width: 100%;
        height: 100%;

        background-color: ${backgroundColor};
        --background-color-context: ${backgroundColor};
    }
`;
