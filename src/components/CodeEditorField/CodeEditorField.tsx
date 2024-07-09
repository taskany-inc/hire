import { ComponentProps, useState } from 'react';
/* eslint-disable no-underscore-dangle */
import { Control, FieldPath, FieldValues, RegisterOptions, useController } from 'react-hook-form';
import { nullable } from '@taskany/bricks';
import { Button, Text, FormEditor, FormControl, FormControlError } from '@taskany/bricks/harmony';

import { FormControlEditor } from '../FormControlEditorForm/FormControlEditorForm';
import { MarkdownRenderer } from '../MarkdownRenderer/MarkdownRenderer';

import { tr } from './CodeEditorField.i18n';
import s from './CodeEditorField.module.css';

type FormEditorProps = JSX.LibraryManagedAttributes<typeof FormEditor, React.ComponentProps<typeof FormEditor>>;

type CodeEditorFieldProps<T extends FieldValues> = {
    name: FieldPath<T>;
    control: Control<T>;
    label?: string;
    options?: RegisterOptions<T>;
    disableAttaches?: boolean;
    uploadLink?: string;
    passedError?: ComponentProps<typeof FormControlError>['error'];
} & FormEditorProps;

export const CodeEditorField = <T extends FieldValues>(props: CodeEditorFieldProps<T>): JSX.Element => {
    const { name, control, options, label, disableAttaches, uploadLink, passedError, ...restProps } = props;
    const markdownRendererMinHeight = props.height;
    const [preview, setPreview] = useState(false);
    const previewButtonTitle = preview ? tr('Editing') : tr('Preview');
    const { field, fieldState } = useController({
        name,
        control,
        rules: options,
    });

    return (
        <div className={s.CommentFormWrapper}>
            <Text as="label" size="m" className={s.Label} weight="bold">
                {label}
            </Text>
            {preview ? (
                <MarkdownRenderer minHeight={String(markdownRendererMinHeight)} value={control._getWatch(name)} />
            ) : (
                <>
                    <FormControl>
                        <FormControlEditor
                            height={200}
                            uploadLink={uploadLink}
                            disableAttaches={disableAttaches}
                            {...restProps}
                            {...field}
                            outline
                        />
                        {nullable(fieldState.error && passedError, (e) => (
                            <FormControlError error={e} />
                        ))}
                    </FormControl>
                </>
            )}

            <Button
                className={s.PreviewButton}
                type="button"
                onClick={() => setPreview(!preview)}
                text={previewButtonTitle}
            />
        </div>
    );
};
