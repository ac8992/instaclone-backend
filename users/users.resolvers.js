import client from "../client";

export default {
    User: {
        totalfollowing: ({id}) => client.user.count({
                where: {followers: {some: {id}}}
            }),

        totalfollowers: ({id}) => client.user.count({
                where: {following: {some: {id}}}
            }),

        isMe: ({id}, args, {loggedInUser}) => {
            if (!loggedInUser) {
                return false;
            }
            return id === loggedInUser.id;
        },

        isFollowing: async({id}, _, {loggedInUser}) => {
            if (!loggedInUser) {
                return false;
            }
            // const exists = await client.user.findUnique({where: {username: loggedInUser.username}}).following({where: {id}});
            const exists = await client.user.count({
                where: {
                    username: loggedInUser.username,
                    following: {
                        some: {
                            id,
                        }
                    }
                }
            })
            return Boolean(exists);
            // return exists.length !== 0;
        },
        photos: ({id}) => client.user.findUnique({where: {id}}).photos(),
    }
}