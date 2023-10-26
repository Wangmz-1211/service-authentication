import express from 'express'
import {
	getUserByEmail,
	createUser,
	getAllUsers,
	getUserByEmailWithAuthentication,
	getUserByToken,
	deleteUserByEmail,
	getUserById,
	updateUser,
} from '../db/user'
import { hashCode, random } from '../utils'
import { get } from 'lodash'

/**
 * Create a new account with the email, username, password, (avatar)
 * @param req request, must have email, username, password, the avatar is optional.
 * @param res response
 * @returns response to client
 */
export const register = async (req: express.Request, res: express.Response) => {
	try {
		let { email, username, password, avatar } = req.body
		// input check
		if (!email || !username || !password) {
			return res.status(400).send('error request body')
		}
		// todo: pattern test
		// email check
		let user = await getUserByEmail(email)
		if (user) {
			return res.status(400).send('the email has already been registered')
		}
		// register
		user = await createUser(email, username, password, avatar)
		if (user) {
			return res.status(200).send({
				_id: user._id,
				email,
				username,
				avatar,
			})
		}
		return res.status(400).send('unknown error')
	} catch (error) {
		console.log(error)
		return res.status(400).send('unknown error occurs')
	}
}

/**
 * !This is an api only for development use.
 * @param req request
 * @param res response
 * @returns response to client, including all the user information without authentication.
 */
export const listAll = async (req: express.Request, res: express.Response) => {
	try {
		const users = await getAllUsers()
		if (users) return res.status(200).json(users).end()
		else return res.status(400).send('unknown error occurs')
	} catch (error) {
		console.log(error)
		return res.status(400).send('known error occurs')
	}
}

/**
 * Change the password of the account.
 * @param req request
 * @param res response
 * @returns response to client
 */
export const changePassword = async (
	req: express.Request,
	res: express.Response
) => {
	try {
		let { email, oldPassword, newPassword } = req.body
		if (oldPassword === newPassword)
			return res
				.status(400)
				.send('The new password is the same as the old one.')
		const user = await getUserByEmailWithAuthentication(email)
		if (!user) return res.status(400).send("User doesn't exit.")
		const expectedHash = hashCode(user.authentication!.salt, oldPassword)
		if (expectedHash !== user.authentication!.hash) {
			return res
				.status(400)
				.send('Please input the correct old password.')
		}
		const newSalt = random()
		const newHash = hashCode(newSalt, newPassword)
		user.authentication!.hash = newHash
		user.authentication!.salt = newSalt
		user.save()
		return res.sendStatus(200)
	} catch (error) {
		console.log(error)
		return res.status(400).send('unknown error occurs')
	}
}

/**
 * Change the username of an user.
 * In the req body, an `email` and an `username` are necessary, where the `username` refers to
 * the new username.
 * @param req
 * @param res
 * @returns status code 200 | 400
 */
export const changeUsername = async (req: express.Request, res: express.Response) => {
	try {
		const userId: string = get(req, 'identity.id')!
		let { username } = req.body
		if (!username) return res.status(400).send('The username is null.')
		const user = await updateUser(userId, { username })
		return res.sendStatus(200)
	} catch (error) {
		console.error('[Controller-change-username] ', error)
		return res.status(400).send('unknown error occurs')
	}
}

/**
 * Generate a sessionToken and store in both database and client(cookie).
 * @param req request
 * @param res response
 * @returns response to client with cookie
 */
export const login = async (req: express.Request, res: express.Response) => {
	try {
		let { email, password } = req.body
		// todo: pattern test
		if (!email || !password)
			return res
				.status(400)
				.send('Please input the correct email and password.')
		const user = await getUserByEmailWithAuthentication(email)
		if (!user) return res.status(400).send("The user doesn't exist.")
		const expectedHash = hashCode(user.authentication!.salt, password)
		if (expectedHash !== user.authentication!.hash)
			return res.status(400).send('Check the input email and password.')
		const sessionToken = random()
		res.cookie('sessionToken', sessionToken, {
			// 10 min
			maxAge: 600000,
		})
		user.authentication!.sessionToken = sessionToken
		user.save()
		const userInformation = await getUserByEmail(email)
		return res.status(200).send(userInformation)
	} catch (error) {
		console.log(error)
		return res.status(400).send('unknown error occurs')
	}
}

/**
 * This controller is for initializing the initial state of the
 * user reducer. If the user refresh the page after getting the
 * token, the sessionToken will stay but the redux information will
 * lose. So whenever loading the page, this could be request.
 * @param req
 * @param res
 * @returns user information
 */
export const loginStatus = async (
	req: express.Request,
	res: express.Response
) => {
	try {
		let { sessionToken } = req.cookies
		if (!sessionToken) return res.sendStatus(403)
		const user = await getUserByToken(sessionToken)
		if (!user) return res.sendStatus(403)
		return res.status(200).send(user)
	} catch (error) {
		console.error('[Controller-user-login-status] ', error)
		return res.sendStatus(400)
	}
}

/**
 * Clear the sessionToken at both client(cookie) and database.
 *
 * @param req request
 * @param res response
 * @returns response to client
 */
export const logout = async (req: express.Request, res: express.Response) => {
	try {
		let { sessionToken } = req.cookies
		if (!sessionToken) return res.status(400).send("You haven't logged in.")
		const user = await getUserByToken(sessionToken)
		if (!user) return res.status(400).send('Token not exist.')
		res.cookie('sessionToken', '', {
			maxAge: 0,
		})
		user.authentication!.sessionToken = ''
		user.save()
		return res.sendStatus(200)
	} catch (error) {
		console.log(error)
		return res.status(400).send('unknown error occurs.')
	}
}

export const deleteUser = async (
	req: express.Request,
	res: express.Response
) => {
	try {
		let { email } = req.body
		if (!email) return res.status(400).send('The email must be specified.')
		const response = await deleteUserByEmail(email)
		return res.sendStatus(200)
	} catch (error) {
		console.log(error)
		return res.status(400).send('unknown error occurs')
	}
}

export const changeAvatar = async (
	req: express.Request,
	res: express.Response
) => {
	try {
		let { avatar } = req.body
		const id = get(req, 'identity._id')!
		// maybe the avatar url should be checked here
		await updateUser(id, { avatar })
		return res.sendStatus(200)
	} catch (error) {
		console.log(error)
		return res.status(400).send('unknown error occurs')
	}
}

export const userInfo = async (req: express.Request, res: express.Response) => {
	try {
		let { id } = req.params
		const pattern = /\b[0-9a-f]{24}$\b/
		if (!id || !pattern.test(id))
			return res.status(400).send('id is need to get user information')
		const user = await getUserById(id)
		if (!user) return res.status(400).send("user doesn't exist")
		return res.status(200).send(user)
	} catch (error) {
		console.log('[user-controller-userInfo]', error)
		return res.status(400).send('unknown error occurs')
	}
}

/**
 * This function is designed to confirm the user identity for other services.
 * ! This function is for server only.
 * ! No user will call this.
 * @param req 
 * @param res 
 * @returns 
 */
export const authenticateStatus = async (
	req: express.Request,
	res: express.Response
) => {
	try {
		let { sessionToken } = req.body
		if (!sessionToken) throw new Error('token error')
		const user = await getUserByToken(sessionToken)
		if (!user) throw new Error("user doesn't exist.")
		return res.send(user)
	} catch (error) {
		console.log(error)
		return res.sendStatus(400)
	}
}
