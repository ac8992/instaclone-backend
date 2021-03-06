import client from "../../client"
import { uploadToS3 } from "../../shared/shared.util";
import {processHashtags} from "../photos.util";

export default {
    Mutation: {
        uploadPhoto: async(_, {file, caption}, {loggedInUser}) => {
            let hashtagObj = [];
            if(caption) {
               hashtagObj = processHashtags(caption);
            }
            const fileUrl = await uploadToS3(file, loggedInUser.id, "uploads");
            return client.photo.create({
                data: {
                    file: fileUrl,
                    caption,
                    user: {
                        connect: {
                            id: loggedInUser.id,
                        },
                    },
                    ...(hashtagObj.length > 0 && {
                        hashtags: {
                            connectOrCreate: hashtagObj
                        },
                      }),
                }
            })
        }
    }
}