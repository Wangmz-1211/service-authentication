import { get } from 'lodash'
import express from 'express'

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