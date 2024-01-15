import { StandConfig } from '.';

const isFrontend = (): boolean => typeof window !== 'undefined';

export const readBooleanFromMetaTag = (value: keyof StandConfig): boolean | undefined => {
    if (!isFrontend()) {
        return undefined;
    }

    const element = document.querySelector(`meta[property='${value}']`);

    if (!element) {
        return undefined;
    }

    const content = element.getAttribute('content');

    if (!content) {
        return undefined;
    }

    return content === 'true';
};
