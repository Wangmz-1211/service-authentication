import mongoose from 'mongoose'
import { random, hashCode } from '../utils'

export const UserSchema = new mongoose.Schema({
	email: {
		type: String,
		required: true,
	},
	username: {
		type: String,
		required: true,
	},
	avatar: {
		type: String,
		required: false,
	},
	authentication: {
		hash: {
			type: String,
			required: true,
			select: false,
		},
		salt: {
			type: String,
			required: true,
			select: false,
		},
		sessionToken: {
			type: String,
			select: false,
		},
	},
})

export const UserModel = mongoose.model('User', UserSchema)

export const getAllUsers = () => UserModel.find()
export const getUserById = (id: string) => UserModel.findById(id)
export const getUserByEmail = (email: string) => UserModel.findOne({ email })
export const getUserByToken = (sessionToken: string) =>
	UserModel.findOne({ 'authentication.sessionToken': sessionToken })

/**
 * Get the full user information for login or something else.
 * ! The information should never be on wire.
 * @param email user's email string
 * @returns full user information
 */
export const getUserByEmailWithAuthentication = (email: string) =>
	UserModel.findOne({ email }).select(
		'+authentication.hash +authentication.salt +authentication.sessionToken'
	)

export const createUser = async (
	email: string,
	username: string,
	password: string,
	avatar: string | null
) => {
	const salt = random()
	const hash = hashCode(salt, password)
	// if( !avatar) avatar = 'none'
	const info = {
		email,
		username,
		avatar,
		authentication: {
			salt,
			hash,
		},
	}
	return UserModel.create(info).then((user) => user)
}

export const deleteUserByEmail = (email: string) =>
	UserModel.deleteOne({ email })

export const updateUser = (id: string, change: Record<string, any>) =>
	UserModel.findByIdAndUpdate(id, change)
