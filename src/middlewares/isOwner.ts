import { get } from 'lodash'
import express from 'express'

/**
 * This middleware is just for confirming the user has the privilege to make some operation to the resource.
 * @param req for checking, a `email` of the resource's owner should be concluded in the request body
 * @param res 
 * @param next If the user is owner, the request will go to the next function.
 * @returns If the user requesting is not the owner of the resource, this would return a 403 response.
 */
const isOwner = async (
	req: express.Request,
	res: express.Response,
	next: express.NextFunction
) => {
	try {
		const userEmail: string | any = get(req, 'identity.email')!
		if (!userEmail) return res.sendStatus(403)
		let { email } = req.body
		if (userEmail === email) return next()
		return res.status(403).send('You cannot do this operation.')
	} catch (error) {
		console.log(error)
		return res.status(400).send('unknown error occurs')
	}
}
export default isOwner
