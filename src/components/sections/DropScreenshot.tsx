import { useMemo } from 'react';
import { useDropzone } from 'react-dropzone';

import { tr } from './sections.i18n';

type DropScreenshotProps = {
    onDrop: (acceptedFiles: any) => void;
};

const baseStyle = {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    borderWidth: 2,
    borderRadius: 2,
    borderColor: '#eeeeee',
    borderStyle: 'dashed',
    backgroundColor: 'transparent',
    color: '#bdbdbd',
    outline: 'none',
    transition: 'border .24s ease-in-out',
};

const focusedStyle = {
    borderColor: '#2196f3',
};

const acceptStyle = {
    borderColor: '#00e676',
};

const rejectStyle = {
    borderColor: '#ff1744',
};

export const DropScreenshot = ({ onDrop }: DropScreenshotProps) => {
    const { getRootProps, getInputProps, isFocused, isDragAccept, isDragReject } = useDropzone({
        accept: { 'image/*': [] },
        onDrop,
    });

    const style = useMemo(
        () => ({
            ...baseStyle,
            ...(isFocused ? focusedStyle : {}),
            ...(isDragAccept ? acceptStyle : {}),
            ...(isDragReject ? rejectStyle : {}),
        }),
        [isFocused, isDragAccept, isDragReject],
    );

    return (
        <section className="container">
            <div {...getRootProps({ style })}>
                <input {...getInputProps()} multiple />
                <p>{tr('Drag and drop files or click and select from the list')}</p>
            </div>
        </section>
    );
};
