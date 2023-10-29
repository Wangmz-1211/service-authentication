/**
 * *This file contains several api functions related to authentication service.
 */

/* server related setting */
const protocol = 'http'
const host = process.env.AUTHENTICATION_HOST || 'localhost'
const port = process.env.AUTHENTICATION_PORT || 8081
const SERVER = protocol + '://' + host + ':' + port

/* patterns */
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const idPattern = /\b[0-9a-f]{24}$\b/

/**
 * Register a new account
 * @param email
 * @param username
 * @param password
 * @param avatar (optional)
 * @returns user object, with _id, username, email, avatar(if exist)
 */
export const register = async (
	email: string,
	username: string,
	password: string,
	avatar: string | null
) => {
	try {
		if (!email || !username || !password || !emailPattern.test(email))
			return
		const res = await fetch(SERVER + '/api/user/register', {
			method: 'PUT',
			body: JSON.stringify({
				email,
				username,
				password,
				avatar,
			}),
			headers: {
				'Content-Type': 'application/json',
			},
			credentials: 'include',
		})
		if (res.status === 200) {
			return await res.json()
		} else {
			const info = await res.text()
			throw new Error(info)
		}
	} catch (error) {
		console.log('[API-authentication-register]', error)
		return
	}
}

/**
 * Login to an account
 * @param email
 * @param password
 * @returns user information
 */
export const login = async (email: string, password: string) => {
	try {
		if (!email || !password || !emailPattern.test(email)) return
		const res = await fetch(SERVER + '/api/user/login', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			credentials: 'include',
			body: JSON.stringify({
				email,
				password,
			}),
		})
		if (res.status === 200) {
			return await res.json()
		} else {
			const info = await res.text()
			throw new Error(info)
		}
	} catch (error) {
		console.log('[API-authentication-login]', error)
		return
	}
}

/**
 * Tell server to clear cookies and sessionToken in database
 * @returns 200 | 400
 */
export const logout = async () => {
	try {
		const res = await fetch(SERVER + '/api/user/logout', {
			method: 'POST',
			credentials: 'include',
		})
		if (res.status === 200) {
			return 200
		} else {
			const info = await res.text()
			throw new Error(info)
		}
	} catch (error) {
		console.log('[API-authentication-logout]', error)
		return 400
	}
}

/**
 * Change the password, credential is unnecessary.
 * @param email
 * @param oldPassword
 * @param newPassword
 * @returns 200 | 400
 */
export const changePassword = async (
	email: string,
	oldPassword: string,
	newPassword: string
) => {
	try {
		if (
			!email ||
			!oldPassword ||
			!newPassword ||
			!emailPattern.test(email) ||
			oldPassword === newPassword
		)
			throw new Error('input error')
		const res = await fetch(SERVER + '/api/user/change-password', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			credentials: 'include',
			body: JSON.stringify({
				email,
				oldPassword,
				newPassword,
			}),
		})
		if (res.status === 200) {
			return 200
		} else {
			const info = await res.text()
			throw new Error(info)
		}
	} catch (error) {
		console.log('[API-authentication-changePassword]', error)
		return 400
	}
}

/**
 * Change avatar of oneself. The user **must** have logged in.
 * @param email
 * @param avatar new avatar url
 * @returns 200 | 400
 */
export const changeAvatar = async (email: string, avatar: string) => {
	try {
		if (!email || !avatar || !emailPattern.test(email))
			throw new Error('input error')
		const res = await fetch(SERVER + '/api/user/change-avatar', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			credentials: 'include',
			body: JSON.stringify({
				email,
				avatar,
			}),
		})
		if (res.status === 200) {
			return 200
		} else {
			const info = await res.text()
			throw new Error(info)
		}
	} catch (error) {
		console.log('[API-authentication-changeAvatar]', error)
		return 400
	}
}

/**
 * Delete a user itself. The credential is **necessary**.
 * **This method is dangerous, can never be undo.**
 * @param email the user's own email
 * @returns 200 | 400
 */
export const deleteUser = async (email: string) => {
	try {
		if (!email || !emailPattern.test(email)) throw new Error('input error')
		const res = await fetch(SERVER + '/api/user/delete', {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
			},
			credentials: 'include',
			body: JSON.stringify({
				email,
			}),
		})
		if (res.status === 200) {
			return 200
		} else {
			const info = await res.text()
			throw new Error(info)
		}
	} catch (error) {
		console.log('[API-authentication-deleteUser]', error)
		return 400
	}
}

/**
 * List the information of all the users in the database
 * @returns all user information
 */
export const userList = async () => {
	try {
		const res = await fetch(SERVER + '/user/list', {
			method: 'GET',
			credentials: 'include',
		})
		if (res.status === 200) {
			return await res.json()
		} else {
			const info = await res.text()
			throw new Error(info)
		}
	} catch (error) {
		console.log('[API-authentication-userList]', error)
		return
	}
}

/**
 * Get the information of the specific user.
 * @param id 24-bit hex string
 * @returns user information
 */
export const userInfo = async (id: string) => {
	try {
		if (!id || !idPattern.test(id)) throw new Error('input error')
		const res = await fetch(SERVER + '/api/user/' + id, {
			method: 'GET',
			credentials: 'include',
		})
		if (res.status === 200) {
			return await res.json()
		} else {
			const info = await res.text()
			throw new Error(info)
		}
	} catch (error) {
		console.log('[API-authentication-userInfo]', error)
		return
	}
}

/**
 * ! service use only.
 * This api is designed for other services to confirm the user identity.
 * @param sessionToken the service should get the sessionToken from the cookie,
 *  and then send to the authentication service through the request body.
 * @return user information.
 */
export const authenticateStatus = async (sessionToken: string) => {
	try {
		if (!sessionToken) return
		const res = await fetch(SERVER + '/api/user/check', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				sessionToken,
			}),
			credentials: 'include',
		})
		if (res.status === 200) return await res.json()
		return
	} catch (error) {
		console.log('[API-authentication-check]', error)
		return
	}
}

/**
 * Check the user's login status by cookie. This can be used to fetch information
 * from the server after a page refresh operation.
 * @returns the user information
 */
export const loginStatus = async () => {
	try {
		const res = await fetch(SERVER + '/api/user/login/status', {
			method: 'POST',
			credentials: 'include',
		})
		if (res.status == 200) return await res.json() //user information
		return
	} catch (error) {
		console.log('[API-authentication-login-check]', error)
		return
	}
}

/**
 * Change a user's own username.
 * @param email the user's email, for checking identity
 * @param username the new desired username
 * @returns
 */
export const changeUsername = async (email: string, username: string) => {
	try {
		const res = await fetch(SERVER + '/api/user/change-username', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			credentials: 'include',
			body: JSON.stringify({
				email,
				username,
			}),
		})
		if (res.status === 200) return
		const info = await res.text()
		throw new Error(info)
	} catch (error) {
		console.error('[API-authentication-change-username] ', error)
		return
	}
}
