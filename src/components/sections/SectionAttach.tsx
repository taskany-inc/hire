import { Link, BinIcon } from '@taskany/bricks';

import { useAttachRemoveMutation } from '../../api/attach/attach-hooks';
import { Confirmation, useConfirmation } from '../Confirmation';

type SectionAttachProps = {
    filename: string;
    fileId: string;
    canEditAttach: boolean;
};

export const SectionAttach = ({ filename, fileId, canEditAttach }: SectionAttachProps) => {
    const deleteAttach = useAttachRemoveMutation();

    const removeAttach = () => deleteAttach.mutateAsync(fileId);
    const deleteAttachConfirmation = useConfirmation({
        message: 'Delete file?',
        onAgree: removeAttach,
        destructive: true,
    });

    return (
        <div>
            <Link inline target="_blank" href={`/api/attach/${fileId}`}>
                {filename}
            </Link>
            {canEditAttach && <BinIcon size="s" onClick={deleteAttachConfirmation.show} />}
            <Confirmation {...deleteAttachConfirmation.props} />
        </div>
    );
};
