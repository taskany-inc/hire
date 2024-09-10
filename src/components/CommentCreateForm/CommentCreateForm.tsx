import { InterviewStatus, RejectReason } from '@prisma/client';
import React, { useState, useCallback, ComponentProps, useMemo } from 'react';
import { nullable } from '@taskany/bricks';
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
    Avatar,
} from '@taskany/bricks/harmony';

import { useSession } from '../../contexts/appSettingsContext';
import { CommentForm } from '../CommentForm/CommentForm';
import { ActivityFeedItem, ActivityFeedItemContent } from '../ActivityFeed/ActivityFeed';
import { CommentSchema } from '../../modules/commentTypes';
import { InterviewRejectReasonDropdown } from '../InterviewRejectReasonDropdown/InterviewRejectReasonDropdown';
import { interviewStatus } from '../../utils/dictionaries';

import { tr } from './CommentCreateForm.i18n';
import s from './CommentCreateForm.module.css';

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
                    setText(text ?? rejectReasons[0].text);

                    setIsOpen(false);
                    setStatusInterview(InterviewStatus.REJECTED);
                },
                text: tr('Reject'),
            },
        ];

        return items;
    }, [rejectReasons, onRejectReasonsText, text]);

    return (
        <ActivityFeedItem>
            <Avatar size="m" email={session?.user?.email} name={session?.user?.name} />

            <ActivityFeedItemContent>
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
                            value={text}
                            rejectReasons={rejectReasons}
                            onChange={onRejectReasonsText}
                        />
                    ))}
                    actionButton={
                        <>
                            {!statusInterview && (
                                <Button view="primary" disabled={busy} type="submit" text={tr('Comment')} />
                            )}
                            {nullable(isVisibleHireOrRejected, () => (
                                <div className={s.InterviewStatusWrapper}>
                                    <Button
                                        disabled={busy}
                                        type="submit"
                                        brick="right"
                                        text={
                                            statusInterview
                                                ? interviewStatus[statusInterview as InterviewStatus]
                                                : tr('Status interview')
                                        }
                                    />
                                    <Dropdown isOpen={isOpen} onClose={() => setIsOpen(false)}>
                                        <DropdownTrigger
                                            renderTrigger={(props) => (
                                                <div ref={props.ref}>
                                                    <Button
                                                        brick="left"
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
                                </div>
                            ))}
                        </>
                    }
                    uploadLink={uploadLink}
                />
            </ActivityFeedItemContent>
        </ActivityFeedItem>
    );
};

export default CommentCreateForm;
