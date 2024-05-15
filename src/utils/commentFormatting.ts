import { ReactionsMap } from '../modules/reactionTypes';
import { CommentWithUserAndEmoji } from '../modules/commentTypes';

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
