declare module 'safe-localstorage' {
    const content: {
        get: (key: string, onLocalStorageNotAvailable?: VoidFunction) => string;
        set: (key: string, value: string, onLocalStorageNotAvailable?: VoidFunction) => void;
        remove: (key: string, onLocalStorageNotAvailable?: VoidFunction) => void;
        removeAll: (onLocalStorageNotAvailable?: VoidFunction) => void;
    };
    export default content;
}

declare module 'color-contrast-checker' {
    class ColorContrastChecker {
        isLevelCustom: any;
    }
    export default ColorContrastChecker;
}
