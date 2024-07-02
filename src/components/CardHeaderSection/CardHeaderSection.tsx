import { nullable, Badge } from '@taskany/bricks';
import { Text, Dot } from '@taskany/bricks/harmony';

import { SectionStatusTagPalette } from '../../utils/tagPalette';
import { generatePath, Paths } from '../../utils/paths';
import {
    InterviewWithRelations,
    SectionWithSectionTypeAndInterviewerAndSolutionsRelations,
} from '../../modules/interviewTypes';
import { getSectionChip } from '../helpers';
import { CandidateSelectedSectionBadge } from '../CandidateSelectedSectionBadge';
import { Link } from '../Link';
import { DropdownMenuItem } from '../TagFilterDropdown';
import config from '../../config';
import { TitleMenu } from '../TitleMenu/TitleMenu';

import s from './CardHeaderSection.module.css';
import { tr } from './CardHeaderSection.i18n';

interface CardHeaderSectionProps extends React.HTMLAttributes<HTMLDivElement> {
    name: string;
    timeAgo: string;
    section: SectionWithSectionTypeAndInterviewerAndSolutionsRelations;
    interview: InterviewWithRelations;
    menu?: DropdownMenuItem[];
}

export const CardHeaderSection: React.FC<CardHeaderSectionProps> = ({ name, timeAgo, section, interview, menu }) => {
    const sectionChip = getSectionChip(section);
    const isSelected = section.id === interview.candidateSelectedSectionId;
    const link = generatePath(Paths.SECTION, {
        interviewId: interview.id,
        sectionId: section.id,
    });
    const userByEmailLink = `${config.sourceUsers.userByEmailLink}/${section.interviewer.email}`;

    return (
        <div className={s.CardHeaderSection}>
            <div className={s.CardHeaderSectionSubtitle}>
                <Text size="l" weight="bold" className={s.CardHeaderSectionName}>
                    {link ? <Link href={link}>{section.sectionType.title}</Link> : section.sectionType.title}
                    {menu && <TitleMenu items={menu} />}
                </Text>
                <Badge size="l" color={SectionStatusTagPalette[sectionChip]}>
                    {sectionChip}
                </Badge>
            </div>
            <div className={s.CardHeaderSectionSubtitle}>
                {isSelected && <CandidateSelectedSectionBadge section={section} interview={interview} />}
                {nullable(section.description, (sectionName) => (
                    <Text size="s">{sectionName}</Text>
                ))}
                <Dot size="s" color={SectionStatusTagPalette[sectionChip]} />
                {nullable(name, (n) => (
                    <>
                        <Text size="xs" weight="bold">
                            {tr('Interviewer ')}
                            <Link href={userByEmailLink} inline target="_blank">
                                {n}
                            </Link>
                        </Text>
                        <span>—</span>
                        <Text size="xs">{timeAgo}</Text>
                    </>
                ))}
            </div>
        </div>
    );
};
