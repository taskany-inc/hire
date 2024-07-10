import { InterviewStatus, RejectReason } from '@prisma/client';
import React, { useState, useCallback, ComponentProps, useMemo } from 'react';
import { UserPic, nullable } from '@taskany/bricks';
import { IconDownSmallSolid, IconUpSmallSolid } from '@taskany/icons';
import {
    FormEditor,
    Button,
    Dropdown,
    DropdownTrigger,
    DropdownPanel,
    MenuItem,
    ListView,
    ListViewItem,
} from '@taskany/bricks/harmony';

import { useSession } from '../../contexts/appSettingsContext';
import { CommentForm } from '../CommentForm/CommentForm';
import { ActivityFeedItem } from '../ActivityFeed';
import { CommentSchema } from '../../modules/commentTypes';
import { InterviewRejectReasonDropdown } from '../InterviewRejectReasonDropdown/InterviewRejectReasonDropdown';

import { tr } from './CommentCreateForm.i18n';

interface CommentCreateFormProps extends Omit<React.ComponentProps<typeof CommentForm>, 'actionButton'> {
    onSubmit: (comment: CommentSchema) => void;
    onChange?: (comment: CommentSchema) => void;
    attachFormatter?: ComponentProps<typeof FormEditor>['attachFormatter'];
    uploadLink?: string;
    rejectReasons?: RejectReason[];
    isVisibleHireOrRejected?: boolean | null;
    status?: InterviewStatus | undefined;
}

const CommentCreateForm: React.FC<CommentCreateFormProps> = ({
    text: currentText = '',
    onSubmit,
    onFocus,
    onCancel,
    onChange,
    uploadLink,
    isVisibleHireOrRejected,
    rejectReasons = [],
    status,
}) => {
    const session = useSession();
    const [text, setText] = useState(currentText);
    const [statusInterview, setStatusInterview] = useState<InterviewStatus | undefined>(status);
    const [focused, setFocused] = useState(Boolean(currentText));
    const [busy, setBusy] = useState(false);
    const [visibleRejectOption, setVisibleRejectOption] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const onCommentFocus = useCallback(() => {
        setFocused(true);
        onFocus?.();
    }, [onFocus]);

    const onCommentChange = useCallback(
        ({ text }: { text: string }) => {
            setText(text);
            onChange?.({ text });
        },
        [onChange],
    );

    const onCommentSubmit = useCallback(
        async (form: CommentSchema) => {
            setBusy(true);
            setFocused(false);
            onSubmit?.(form);
            setText('');
            setStatusInterview(undefined);
            setBusy(false);
            setFocused(true);
        },
        [onSubmit],
    );

    const onRejectReasonsText = useCallback(
        (rejectReason: string) => {
            setText(rejectReason);
        },
        [setText],
    );

    const onCancelCreate = useCallback(() => {
        setBusy(false);
        setFocused(false);
        setText('');
        setStatusInterview(undefined);

        onCancel?.();
    }, [onCancel]);

    const statusInterviewMenuItems = useMemo(() => {
        const items = [
            {
                onClick: () => {
                    setStatusInterview(InterviewStatus.HIRED);
                    setIsOpen(false);
                    onRejectReasonsText('');
                },

                text: tr('Hire'),
            },
            {
                onClick: () => {
                    setVisibleRejectOption(true);
                    setText(rejectReasons[0]?.text);
                    setIsOpen(false);
                    setStatusInterview(InterviewStatus.REJECTED);
                },
                text: tr('Reject'),
            },
        ];

        return items;
    }, [rejectReasons, onRejectReasonsText]);

    return (
        <ActivityFeedItem>
            <UserPic size={32} email={session?.user?.email} name={session?.user?.name} />

            <CommentForm
                text={text}
                focused={focused}
                busy={busy}
                status={statusInterview}
                onChange={onCommentChange}
                onSubmit={onCommentSubmit}
                onCancel={onCancelCreate}
                onFocus={onCommentFocus}
                interviewRejectReason={nullable(visibleRejectOption, () => (
                    <InterviewRejectReasonDropdown
                        rejectReasons={rejectReasons}
                        onChangeRejectReasons={onRejectReasonsText}
                    />
                ))}
                actionButton={
                    <>
                        <Button view="primary" disabled={busy} type="submit" text={tr('Comment')} />
                        {nullable(isVisibleHireOrRejected, () => (
                            <>
                                <Dropdown isOpen={isOpen} onClose={() => setIsOpen(false)}>
                                    <DropdownTrigger
                                        renderTrigger={(props) => (
                                            <div ref={props.ref}>
                                                <Button
                                                    text={statusInterview}
                                                    type="button"
                                                    onClick={() => setIsOpen(!isOpen)}
                                                    iconRight={
                                                        props.isOpen ? (
                                                            <IconUpSmallSolid size="s" />
                                                        ) : (
                                                            <IconDownSmallSolid size="s" />
                                                        )
                                                    }
                                                />
                                            </div>
                                        )}
                                    />
                                    <DropdownPanel placement="top-end">
                                        <ListView>
                                            {statusInterviewMenuItems?.map((status) => (
                                                <ListViewItem
                                                    key={status.text}
                                                    value={status}
                                                    renderItem={({ active, hovered, ...props }) => (
                                                        <MenuItem
                                                            hovered={active || hovered}
                                                            onClick={status.onClick}
                                                            key={status.text}
                                                            {...props}
                                                        >
                                                            {status.text}
                                                        </MenuItem>
                                                    )}
                                                />
                                            ))}
                                        </ListView>
                                    </DropdownPanel>
                                </Dropdown>
                            </>
                        ))}
                    </>
                }
                uploadLink={uploadLink}
            />
        </ActivityFeedItem>
    );
};

export default CommentCreateForm;
