import express from 'express'
import { getUserByToken } from '../db/user'
import { merge } from 'lodash'

/**
 * This middleware aims to confirm the user has logged in, and the cookie haven't expired.
 * For further operations, the user information will be merged into the `req` by lodash.
 * When there's demanding for the user information, the information can be extracted by 
 * `const user = get(req, 'identity')` or partly `const email = get(req, 'identity.email')`,
 * where `get` is a function from module `lodash`.
 * @param req 
 * @param res 
 * @param next 
 * @returns 
 */
export const isAuthenticated = async (
	req: express.Request,
	res: express.Response,
	next: express.NextFunction
) => {
	try {
		let { sessionToken } = req.cookies
		if (!sessionToken) return res.status(403).send("You haven't logged in.")
		const user = await getUserByToken(sessionToken)
		if (!user) return res.status(403).send('session token not exist')
		merge(req, { identity: user })
		return next()
	} catch (error) {
		console.log(error)
		res.status(400).send('unknown error occurs')
	}
}

export default isAuthenticated