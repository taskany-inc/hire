import ColorContrastChecker from 'color-contrast-checker';

export const generateColor = () => {
    const ccc = new ColorContrastChecker();

    // default background
    const backgroundColor = '#1b1b1c';
    // contrast ratio
    const ratio = 6;

    const genColor = () => `#${`${Math.random().toString(16)}000000`.substring(2, 8)}`;
    let generatedColor = '';
    let valid = false;

    while (!valid) {
        generatedColor = genColor();
        try {
            // our kawaii generator does not always produce a valid hex
            valid = ccc.isLevelCustom(generatedColor, backgroundColor, ratio);
        } catch (e) {
            // and under the color-contrast-checker hood there is a validator that crashes with an error on bad hex.
            // Therefore, we generate until we're blue in the face.
            valid = ccc.isLevelCustom(generatedColor, backgroundColor, ratio);
        }
    }

    return generatedColor;
};
