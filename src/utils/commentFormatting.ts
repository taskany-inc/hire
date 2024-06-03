import { ReactionsMap } from '../modules/reactionTypes';
import { CommentWithUserAndEmoji, CommentWithUserAndReaction } from '../modules/commentTypes';
import { SectionWithSectionTypeAndInterviewerAndSolutionsRelations, ActivityFeedItem } from '../modules/interviewTypes';

export const commentFormatting = (comments: CommentWithUserAndEmoji[] | undefined) => {
    const limit = 10;
    const commentWithReactions = comments?.map((comment: CommentWithUserAndEmoji) => {
        const reactions = comment?.reactions.reduce<ReactionsMap>((acc, cur) => {
            const data = {
                userId: cur.userId,
                name: cur.user.name,
            };

            if (acc[cur.emoji]) {
                acc[cur.emoji].count += 1;
                acc[cur.emoji].authors.push(data);
            } else {
                acc[cur.emoji] = {
                    count: 1,
                    authors: [data],
                    remains: 0,
                };
            }

            return acc;
        }, {});

        for (const key in reactions) {
            if (key in reactions) {
                const { authors } = reactions[key];

                if (authors.length > limit) {
                    reactions[key].authors = authors.slice(0, limit);
                    reactions[key].remains = authors.length - limit;
                }
            }
        }
        return { ...comment, reactions };
    });

    return commentWithReactions;
};

export const getActivityFeed = (
    comments: CommentWithUserAndReaction[],
    sections: SectionWithSectionTypeAndInterviewerAndSolutionsRelations[],
) => {
    const activityFeed: ActivityFeedItem[] = sections.map((section) => {
        return {
            type: 'section',
            value: section,
        };
    });

    for (const comment of comments) {
        activityFeed.push({
            type: 'comment',
            value: comment,
        });
    }

    return activityFeed.sort((a, b) => a.value.createdAt.getTime() - b.value.createdAt.getTime());
};
