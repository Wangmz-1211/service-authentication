import express from 'express'
import {
	register,
	listAll,
	changePassword,
	login,
	loginStatus,
	logout,
	deleteUser,
	changeAvatar,
	userInfo,
	authenticateStatus,
} from '../controller/user'
import isAuthenticated from '../middlewares/isAuthenticated'
import isOwner from '../middlewares/isOwner'

const userRouter = express.Router()

userRouter.post('/user/check', authenticateStatus)
userRouter.get('/user/list', listAll)
userRouter.get('/user/:id', userInfo)
userRouter.post('/user/login', login)
userRouter.post('/user/login/status', loginStatus)
userRouter.post('/user/logout', logout)
userRouter.post('/user/change-password', changePassword)
userRouter.post('/user/change-avatar', isAuthenticated, isOwner, changeAvatar)
userRouter.put('/user/register', register)
userRouter.delete('/user/delete', isAuthenticated, isOwner, deleteUser)

export default userRouter
