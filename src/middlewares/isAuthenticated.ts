import express from 'express'
import { getUserByToken } from '../db/user'
import { merge } from 'lodash'

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