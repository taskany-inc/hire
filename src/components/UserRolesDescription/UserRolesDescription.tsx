import { nullable } from '@taskany/bricks';
import { Text } from '@taskany/bricks/harmony';
import groupBy from 'lodash.groupby';

import { UserRoles, UserRolesInfo, roleToLabel } from '../../utils/userRoles';

import s from './UserRolesDescription.module.css';

interface UserRolesProps {
    name: string;
    roles: UserRolesInfo;
}

export const UserRolesDescription = ({ name, roles }: UserRolesProps) => {
    return (
        <Text size="s" className={s.UserRolesDescription}>
            <Text weight="bolder">{name}</Text>

            {nullable(roles.admin, () => (
                <Text weight="bold">{roleToLabel(UserRoles.ADMIN)}</Text>
            ))}

            {nullable(roles.problemEditor, () => (
                <Text weight="bold">{roleToLabel(UserRoles.PROBLEM_EDITOR)}</Text>
            ))}

            {nullable(roles.hireStreamManager, (items) => (
                <div>
                    <Text weight="bold" as="span">
                        {roleToLabel(UserRoles.HIRE_STREAM_MANAGER)}:{' '}
                    </Text>
                    <Text as="span">{items.map((stream) => stream.displayName || stream.name).join(', ')}</Text>
                </div>
            ))}

            {nullable(roles.hiringLead, (items) => (
                <div>
                    <Text weight="bold" as="span">
                        {roleToLabel(UserRoles.HIRING_LEAD)}:{' '}
                    </Text>
                    <Text as="span">{items.map((stream) => stream.displayName || stream.name).join(', ')}</Text>
                </div>
            ))}

            {nullable(roles.recruiter, (items) => (
                <div>
                    <Text weight="bold" as="span">
                        {roleToLabel(UserRoles.RECRUITER)}:{' '}
                    </Text>
                    <Text as="span">{items.map((stream) => stream.displayName || stream.name).join(', ')}</Text>
                </div>
            ))}

            {nullable(roles.interviewer, (items) => {
                const grouped = groupBy(items, (item) => item.hireStream.displayName || item.hireStream.name);
                return Object.keys(grouped).map((hireStreamName) => (
                    <div key={hireStreamName}>
                        <Text weight="bold" as="span">
                            {roleToLabel(UserRoles.INTERVIEWER)} {hireStreamName}:{' '}
                        </Text>
                        <Text as="span">
                            {grouped[hireStreamName].map((sectionType) => sectionType.title).join(', ')}
                        </Text>
                    </div>
                ));
            })}
        </Text>
    );
};
