import crypto from 'crypto'

const SECRET = 'service-authentication'

export const random = () => {
	return crypto.randomBytes(128).toString('base64')
}

export const hashCode = (salt: string, data: string) => {
	const hmac = crypto
		.createHmac('sha256', [salt, data].join('/'))
		.update(SECRET)
	return hmac.digest().toString('hex')
}
