import { FC, useState } from 'react';
import { useRouter } from 'next/router';
import { HireStream } from '@prisma/client';
import { Text } from '@taskany/bricks';
import { Button } from '@taskany/bricks/harmony';

import { Paths } from '../../utils/paths';
import { ROLE_DEBUG_COOKIE_NAME } from '../../utils/auth';
import { SectionTypeWithHireStream } from '../../modules/sectionTypeTypes';
import { yearInSeconds } from '../../utils';

import { tr } from './DebugRoles.i18n';
import s from './DebugRoles.module.css';

interface DebugRolesProps {
    hireStreams: HireStream[];
    sectionTypes: SectionTypeWithHireStream[];
}

export const DebugRoles: FC<DebugRolesProps> = ({ hireStreams, sectionTypes }) => {
    const router = useRouter();

    const [admin, setAdmin] = useState(false);
    const [problemEditor, setProblemEditor] = useState(false);
    const [hireStreamManager, setHireStreamManager] = useState<number[]>([]);
    const [hiringLead, setHiringLead] = useState<number[]>([]);
    const [recruiter, setRecruiter] = useState<number[]>([]);
    const [interviewer, setInterviewer] = useState<number[]>([]);

    const onSave = () => {
        const value = new URLSearchParams();

        if (admin) {
            value.set('admin', '');
        }

        if (problemEditor) {
            value.set('problem_editor', '');
        }

        value.set('hire_stream_manager', hireStreamManager.join(','));
        value.set('hiring_lead', hiringLead.join(','));
        value.set('recruiter', recruiter.join(','));
        value.set('interviewer', interviewer.join(','));

        document.cookie = `${ROLE_DEBUG_COOKIE_NAME}=${value};path=/;max-age=${yearInSeconds};SameSite=Strict`;
        router.push(Paths.HOME);
    };

    const onReset = () => {
        document.cookie = `${ROLE_DEBUG_COOKIE_NAME}=;path=/;max-age=0`;
        router.replace(Paths.HOME);
    };

    return (
        <div>
            <div className={s.DebugRolesCards}>
                <label htmlFor="administrator">
                    <input
                        id="administrator"
                        type="checkbox"
                        onChange={() => setAdmin((prev) => !prev)}
                        className={s.DebugRolesCheckBox}
                    />
                    <Text className={s.DebugRolesText}>{tr('Admin')}</Text>
                </label>
                <label htmlFor="problem_editor">
                    <input
                        id="problem_editor"
                        type="checkbox"
                        onChange={() => setProblemEditor((prev) => !prev)}
                        className={s.DebugRolesCheckBox}
                    />
                    <Text className={s.DebugRolesText}>{tr('Problem editor')}</Text>
                </label>
            </div>

            <Text size="xl" className={s.DebugRolesTitle}>
                {tr('Hire streams manager')}
            </Text>
            <div className={s.DebugRolesCards}>
                {hireStreams.map((hireStream) => {
                    return (
                        <label
                            key={`${hireStream.id}${hireStream.name}Hire streams manager`}
                            htmlFor={`${hireStream.id}${hireStream.name}Hire streams manager`}
                        >
                            <input
                                type="checkbox"
                                key={hireStream.id}
                                id={`${hireStream.id}${hireStream.name}Hire streams manager`}
                                onChange={() =>
                                    setHireStreamManager((prev) => {
                                        if (prev.includes(hireStream.id)) {
                                            return prev.filter((h) => h !== hireStream.id);
                                        }

                                        return [...prev, hireStream.id];
                                    })
                                }
                                className={s.DebugRolesCheckBox}
                            />

                            <Text className={s.DebugRolesText}>{hireStream.name}</Text>
                        </label>
                    );
                })}
            </div>

            <Text size="xl" className={s.DebugRolesTitle}>
                {tr('Hire lead')}
            </Text>
            <div className={s.DebugRolesCards}>
                {hireStreams.map((hireStream) => {
                    return (
                        <label
                            key={`${hireStream.id}${hireStream.name}Hire lead`}
                            htmlFor={`${hireStream.id}${hireStream.name}Hire lead`}
                        >
                            <input
                                type="checkbox"
                                key={hireStream.id}
                                id={`${hireStream.id}${hireStream.name}Hire lead`}
                                onChange={() =>
                                    setHiringLead((prev) => {
                                        if (prev.includes(hireStream.id)) {
                                            return prev.filter((h) => h !== hireStream.id);
                                        }

                                        return [...prev, hireStream.id];
                                    })
                                }
                                className={s.DebugRolesCheckBox}
                            />
                            <Text className={s.DebugRolesText}>{hireStream.name}</Text>
                        </label>
                    );
                })}
            </div>

            <Text size="xl" className={s.DebugRolesTitle}>
                {tr('Recruter')}
            </Text>
            <div className={s.DebugRolesCards}>
                {hireStreams.map((hireStream) => {
                    return (
                        <label
                            key={`${hireStream.id}${hireStream.name}Recruter`}
                            htmlFor={`${hireStream.id}${hireStream.name}Recruter`}
                        >
                            <input
                                type="checkbox"
                                key={hireStream.id}
                                id={`${hireStream.id}${hireStream.name}Recruter`}
                                onChange={() =>
                                    setRecruiter((prev) => {
                                        if (prev.includes(hireStream.id)) {
                                            return prev.filter((h) => h !== hireStream.id);
                                        }

                                        return [...prev, hireStream.id];
                                    })
                                }
                                className={s.DebugRolesCheckBox}
                            />
                            <Text className={s.DebugRolesText}>{hireStream.name}</Text>
                        </label>
                    );
                })}
            </div>

            <Text size="xl" className={s.DebugRolesTitle}>
                {tr('Interviewer')}
            </Text>
            <div className={s.DebugRolesCards}>
                {sectionTypes.map((sectionType) => {
                    return (
                        <label
                            key={`${sectionType.id}${sectionType.title}${sectionType.hireStream.name}Interviewer`}
                            htmlFor={`${sectionType.id}${sectionType.title}${sectionType.hireStream.name}Interviewer`}
                        >
                            <input
                                type="checkbox"
                                key={sectionType.id}
                                id={`${sectionType.id}${sectionType.title}${sectionType.hireStream.name}Interviewer`}
                                onChange={() =>
                                    setInterviewer((prev) => {
                                        if (prev.includes(sectionType.id)) {
                                            return prev.filter((h) => h !== sectionType.id);
                                        }

                                        return [...prev, sectionType.id];
                                    })
                                }
                                className={s.DebugRolesCheckBox}
                            />

                            <Text className={s.DebugRolesText}>
                                {sectionType.title} ({sectionType.hireStream.name})
                            </Text>
                        </label>
                    );
                })}
            </div>

            <div className={s.DebugRolesButtonWrapper}>
                <Button view="primary" onClick={onSave} text={tr('Save')} />

                <Button
                    className={s.DebugRolesResetButton}
                    view="danger"
                    onClick={onReset}
                    text={tr('Reset debug cookie')}
                />
            </div>
        </div>
    );
};
