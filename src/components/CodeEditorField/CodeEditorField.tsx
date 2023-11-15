/* eslint-disable no-underscore-dangle */
import { Control, FieldPath, FieldValues, RegisterOptions, useController } from 'react-hook-form';
import styled from 'styled-components';
import { useState } from 'react';
import { Button, FormEditor } from '@taskany/bricks';
import { IconMarkdownOutline } from '@taskany/icons';
import { gray10, gray8 } from '@taskany/colors';

import { FormHelperText, Label } from '../StyledComponents';
import { MarkdownRenderer } from '../MarkdownRenderer/MarkdownRenderer';
import { Tip } from '../Tip';

import { tr } from './CodeEditorField.i18n';

const StyledRoot = styled.div<{ width?: string }>`
    width: ${(props) => (props.width ? props.width : '80%')};
`;

const HintContainer = styled.div`
    display: flex;
    align-items: center;
`;

const StyledPreviewButton = styled(Button)`
    margin-left: auto;
    margin-top: 4px;
`;

const StyledFormEditor = styled(FormEditor)`
    border: 1px solid rgba(255, 255, 255, 0.05);
    max-width: 100%;
`;

const StyledMarkdownIcon = styled.div`
    color: rgba(255, 255, 255, 0.54);
    margin-bottom: -20px;
    margin-right: 5px;
    margin-left: 8px;
`;

type FormEditorProps = JSX.LibraryManagedAttributes<typeof FormEditor, React.ComponentProps<typeof FormEditor>>;

type CodeEditorFieldProps<T extends FieldValues> = {
    name: FieldPath<T>;
    control: Control<T>;
    label?: string;
    options?: RegisterOptions<T>;
    disableAttaches?: boolean;
    uploadLink?: string;
    width?: string;
} & FormEditorProps;

export const CodeEditorField = <T extends FieldValues>(props: CodeEditorFieldProps<T>): JSX.Element => {
    const { name, control, options, label, disableAttaches, uploadLink, width, ...restProps } = props;
    const markdownRendererMinHeight = props.height;
    const { field, fieldState } = useController({
        name,
        control,
        rules: options,
    });
    const [preview, setPreview] = useState(false);

    const previewButtonTitle = preview ? tr('Editing') : tr('Preview');

    return (
        <StyledRoot width={width}>
            <Label>{label}</Label>

            {preview ? (
                <MarkdownRenderer minHeight={String(markdownRendererMinHeight)} value={control._getWatch(name)} />
            ) : (
                <StyledFormEditor uploadLink={uploadLink} disableAttaches={disableAttaches} {...field} {...restProps} />
            )}
            {fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
            <HintContainer>
                <StyledMarkdownIcon>
                    <IconMarkdownOutline size="s" color={gray8} />
                </StyledMarkdownIcon>
                <Tip>{tr('Styling with markdown is supported')}</Tip>
                <StyledPreviewButton
                    color={gray10}
                    type="button"
                    onClick={() => setPreview(!preview)}
                    text={previewButtonTitle}
                />
            </HintContainer>
        </StyledRoot>
    );
};
