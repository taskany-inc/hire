import { FC, useState } from 'react';
import { useRouter } from 'next/router';
import { HireStream } from '@prisma/client';
import styled from 'styled-components';
import { Button, Text } from '@taskany/bricks';

import { Paths } from '../../utils/paths';
import { ROLE_DEBUG_COOKIE_NAME } from '../../utils/auth';
import { SectionTypeWithHireStream } from '../../modules/sectionTypeTypes';
import { yearInSeconds } from '../../utils';

import { tr } from './DebugRoles.i18n';

interface DebugRolesProps {
    hireStreams: HireStream[];
    sectionTypes: SectionTypeWithHireStream[];
}

const StyledTitle = styled(Text)`
    margin-top: 50px;
`;

const StyledCards = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 2px;
    margin: 0 -20px 30px;
    max-width: 70%;
`;

const StyledCheckBox = styled.input`
    width: 20px;
    margin-left: 20px;
    margin-top: 12px;
`;

const StyledText = styled(Text)`
    display: inline-block;
`;

const StyledButton = styled(Button)`
    margin-left: 40px;
`;

export const DebugRoles: FC<DebugRolesProps> = ({ hireStreams, sectionTypes }) => {
    const router = useRouter();

    const [admin, setAdmin] = useState(false);
    const [hireStreamManager, setHireStreamManager] = useState<number[]>([]);
    const [hiringLead, setHiringLead] = useState<number[]>([]);
    const [recruiter, setRecruiter] = useState<number[]>([]);
    const [interviewer, setInterviewer] = useState<number[]>([]);

    const onSave = () => {
        const value = new URLSearchParams();

        if (admin) {
            value.set('admin', '');
        }

        value.set('hire_stream_manager', hireStreamManager.join(','));
        value.set('hiring_lead', hiringLead.join(','));
        value.set('recruiter', recruiter.join(','));
        value.set('interviewer', interviewer.join(','));

        document.cookie = `${ROLE_DEBUG_COOKIE_NAME}=${value};path=/;max-age=${yearInSeconds};SameSite=Strict`;
        router.replace(Paths.HOME);
    };

    const onReset = () => {
        document.cookie = `${ROLE_DEBUG_COOKIE_NAME}=;path=/;max-age=0`;
        router.replace(Paths.HOME);
    };

    return (
        <div>
            <StyledCards>
                {/* Everything seems to be correct, but here it still throws an error */}
                {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                <label htmlFor="administrator">
                    <StyledCheckBox id="administrator" type="checkbox" onChange={() => setAdmin((prev) => !prev)} />
                    <StyledText>{tr('Admin')}</StyledText>
                </label>
            </StyledCards>

            <StyledTitle size="xl">{tr('Hire streams manager')}</StyledTitle>
            <StyledCards>
                {hireStreams.map((hireStream) => {
                    return (
                        <label
                            key={`${hireStream.id}${hireStream.name}Hire streams manager`}
                            htmlFor={`${hireStream.id}${hireStream.name}Hire streams manager`}
                        >
                            <StyledCheckBox
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
                            />

                            <StyledText>{hireStream.name}</StyledText>
                        </label>
                    );
                })}
            </StyledCards>

            <StyledTitle size="xl">{tr('Hire lead')}</StyledTitle>
            <StyledCards>
                {hireStreams.map((hireStream) => {
                    return (
                        <label
                            key={`${hireStream.id}${hireStream.name}Hire lead`}
                            htmlFor={`${hireStream.id}${hireStream.name}Hire lead`}
                        >
                            <StyledCheckBox
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
                            />
                            <StyledText>{hireStream.name}</StyledText>
                        </label>
                    );
                })}
            </StyledCards>

            <StyledTitle size="xl">{tr('Recruter')}</StyledTitle>
            <StyledCards>
                {hireStreams.map((hireStream) => {
                    return (
                        <label
                            key={`${hireStream.id}${hireStream.name}Recruter`}
                            htmlFor={`${hireStream.id}${hireStream.name}Recruter`}
                        >
                            <StyledCheckBox
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
                            />
                            <StyledText>{hireStream.name}</StyledText>
                        </label>
                    );
                })}
            </StyledCards>

            <StyledTitle size="xl">{tr('Interviewer')}</StyledTitle>
            <StyledCards>
                {sectionTypes.map((sectionType) => {
                    return (
                        <label
                            key={`${sectionType.id}${sectionType.title}${sectionType.hireStream.name}Interviewer`}
                            htmlFor={`${sectionType.id}${sectionType.title}${sectionType.hireStream.name}Interviewer`}
                        >
                            <StyledCheckBox
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
                            />

                            <StyledText>
                                {sectionType.title} ({sectionType.hireStream.name})
                            </StyledText>
                        </label>
                    );
                })}
            </StyledCards>

            <Button view="primary" onClick={onSave} text={tr('Save')} />

            <StyledButton view="danger" onClick={onReset} text={tr('Reset debug cookie')} />
        </div>
    );
};
