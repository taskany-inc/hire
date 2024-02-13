import { sendMail } from '../../modules/nodemailer';

import { JobDataMap } from './create';

export const email = async ({ data }: JobDataMap['email']) => {
    return sendMail(data);
};
