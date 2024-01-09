export interface File {
    name: string;
    type: string;
    filePath: string;
}

const fileToMD = (file: File) => {
    switch (true) {
        case file.type.includes('image/'):
            return `![](${file.filePath})`;
        default:
            return `[${file.name}](${file.filePath})`;
    }
};

export const defaultAttachFormatter = (files: File[]) => {
    return files.map(fileToMD).join('\n');
};
