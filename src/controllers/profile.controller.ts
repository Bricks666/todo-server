import { RequestHandler } from "express";
import { UploadedFile } from "express-fileupload";
import { join, resolve } from "path";
import { getStaticRoute, PATHS } from "../config";
import { ProfileServices } from "../services";

export class ProfileControllers {
	static getProfile: RequestHandler = async (req, res, next) => {
		try {
			const {
				user: { userId },
			} = req.body;
			const user = await ProfileServices.getUser(userId);

			res.json({ user });
		} catch (e) {
			next(e);
		}
	};
	static updateProfile: RequestHandler = async (req, res, next) => {
		try {
			const { user, ...newValues } = req.body;
			const photo = req.files?.photo as UploadedFile;
			if (photo) {
				const extension = photo.mimetype.match(/[\w]+$/) || "jpg";
				const photoName = `avatar_${user.userId}_${Date.now()}.${extension}`;

				const innerPath = join(user.userId.toString(), photoName);
				const movePath = resolve(__dirname, PATHS.AVATARS, innerPath);
				const sharePath = getStaticRoute(innerPath);

				photo.name = photoName;
				photo.mv(movePath);

				newValues.photo = sharePath;
			}

			const newUser = await ProfileServices.updateUser(user.userId, newValues);

			return res.json({ user: newUser });
		} catch (e) {
			next(e);
		}
	};
}
