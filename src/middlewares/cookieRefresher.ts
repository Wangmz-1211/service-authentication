import express from 'express'

const cookieRefresher = (
	req: express.Request,
	res: express.Response,
	next: express.NextFunction
) => {
	try {
		let { sessionToken } = req.cookies
		if (sessionToken)
			res.cookie('sessionToken', sessionToken, {
				// 10 min
				maxAge: 600000,
			})
		return next()
	} catch (error) {
		console.log('[middleware-cookieRefresher]', error)
		return next()
	}
}

export default cookieRefresher
