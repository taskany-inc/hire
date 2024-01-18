import { IconBinOutline } from '@taskany/icons';

import { useAttachRemoveMutation } from '../../modules/attachHooks';
import { Confirmation, useConfirmation } from '../Confirmation/Confirmation';
import { Link } from '../Link';
import { pageHrefs } from '../../utils/paths';

import { tr } from './SectionAttach.i18n';

type SectionAttachProps = {
    filename: string;
    fileId: string;
    canEditAttach: boolean;
};

export const SectionAttach = ({ filename, fileId, canEditAttach }: SectionAttachProps) => {
    const deleteAttach = useAttachRemoveMutation();

    const removeAttach = () => deleteAttach.mutateAsync(fileId);
    const deleteAttachConfirmation = useConfirmation({
        message: tr('Delete file?'),
        onAgree: removeAttach,
        destructive: true,
    });

    return (
        <div>
            <Link target="_blank" href={pageHrefs.attach(fileId)}>
                {filename}
            </Link>
            {canEditAttach && <IconBinOutline size="s" onClick={deleteAttachConfirmation.show} />}
            <Confirmation {...deleteAttachConfirmation.props} />
        </div>
    );
};
