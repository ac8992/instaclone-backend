import client from "../../client"
import {createWriteStream} from "fs";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { protectedResolver } from "../users.utils";
import { uploadToS3 } from "../../shared/shared.util";

const resolverFn = async(
    _,
    {firstName, lastName, username, email, password: newPassword, bio, avatar}, {loggedInUser}
) => {
    let avatarUrl = null;
    if(avatar) {
        avatarUrl = await uploadToS3(avatar, loggedInUser.id, "avatars");
        /* const { filename, createReadStream } = await avatar;
        const newFilename = `${loggedInUser.id}-${Date.now()}-${filename}`;
        const readStream = createReadStream();
        const writeStream = createWriteStream(
        process.cwd() + "/uploads/" + newFilename
        );
        readStream.pipe(writeStream);
        avatarUrl = `http://localhost:4001/static/${newFilename}` */
    }
    let uglypassword = null;
    if (newPassword) {
        uglypassword = await bcrypt.hash(newPassword, 10)
    }
    const updatedUser = await client
        .user
        .update({
            where: {
                id: loggedInUser.id,
            },
            data: {
                firstName,
                lastName,
                username,
                email,
                bio,
                ...(uglypassword && {
                    password: uglypassword
                }),
                ...(avatarUrl && { avatar: avatarUrl }),
            }
        })
    if (updatedUser.id) {
        return {ok: true}
    } else {
        return {ok: false, error: "Could not update profile"}
    }
}

export default {
    Mutation : {
        editProfile: protectedResolver(resolverFn)
    }
}