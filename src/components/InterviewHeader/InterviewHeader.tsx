import React, { FC } from 'react';
import { Dropdown, DropdownTrigger, Link, Text, User } from '@taskany/bricks/harmony';
import { nullable } from '@taskany/bricks';
import NextLink from 'next/link';

import { pageHrefs } from '../../utils/paths';
import { useDistanceDate } from '../../hooks/useDateFormat';
import { InterviewWithRelations } from '../../modules/interviewTypes';
import { PageSep } from '../PageSep/PageSep';

import s from './InterviewHeader.module.css';
import { tr } from './InterviewHeader.i18n';

interface InterviewHeaderProps {
    interview: InterviewWithRelations;
    href?: string;
    date: Date;
}

export const InterviewHeader: FC<InterviewHeaderProps> = ({ interview, date }) => {
    const timeAgo = useDistanceDate(date);

    return (
        <>
            <div className={s.Header}>
                <div className={s.HeaderInfo_align_left}>
                    <div className={s.HeaderTitle}>
                        <div className={s.Candidate}>
                            <Text size="xxl" as="span" weight="bolder">
                                #{interview.id} — {interview.candidate.name}
                            </Text>
                        </div>
                        <div>
                            {nullable(interview.hireStream?.displayName, (d) => (
                                <NextLink href={pageHrefs.hireStream(d)} passHref legacyBehavior>
                                    <Link className={s.HireStreamCollapsableItemLink}>
                                        <Text weight="semiBold" size="l" className={s.HireStreamCollapsableItemTitle}>
                                            {interview.hireStream?.displayName}
                                        </Text>
                                    </Link>
                                </NextLink>
                            ))}
                        </div>
                    </div>

                    <div className={s.HeaderStats}>
                        <div className={s.NameWrapper}>
                            <Dropdown>
                                <DropdownTrigger readOnly>
                                    <Text className={s.NameTitle} size="xs" weight="semiBold">
                                        {tr('HR')}
                                    </Text>

                                    <User
                                        email={interview.creator.email || interview.creator.name}
                                        name={interview.creator.name}
                                    />
                                </DropdownTrigger>
                            </Dropdown>
                        </div>
                        {nullable(interview, (i) => (
                            <div className={s.NameWrapper}>
                                <Dropdown>
                                    <DropdownTrigger readOnly>
                                        <Text size="xs" weight="semiBold" className={s.NameTitle}>
                                            {tr('Candidate')}
                                        </Text>
                                        <User
                                            size="s"
                                            email={i.candidate.email || i.candidate.name}
                                            name={i.candidate.name}
                                        />
                                    </DropdownTrigger>
                                </Dropdown>
                            </div>
                        ))}
                    </div>
                </div>
                <div className={s.Wrapper}>
                    <div className={s.HeaderInfo_align_right}>
                        <Text weight="semiBold" size="l" className={s.HireStreamCollapsableItemTitle}>
                            {interview.hireStream?.name}
                        </Text>
                        <Text className={s.TimeAgo} size="s">
                            updated {timeAgo}
                        </Text>
                    </div>
                </div>
            </div>
            <PageSep />
        </>
    );
};
