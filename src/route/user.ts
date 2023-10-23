import express from 'express'
import {
	register,
	listAll,
	changePassword,
	login,
	logout,
	deleteUser,
	changeAvatar,
	userInfo
} from '../controller/user'
import isAuthenticated from '../middlewares/isAuthenticated'
import isOwner from '../middlewares/isOwner'

const userRouter = express.Router()

userRouter.get('/user/list', isAuthenticated, listAll)
userRouter.get('/user/:id', userInfo)
userRouter.post('/user/login', login)
userRouter.post('/user/logout', logout)
userRouter.post('/user/change-password', changePassword)
userRouter.post('/user/change-avatar', isAuthenticated, isOwner, changeAvatar)
userRouter.put('/user/register', register)
userRouter.delete('/user/delete', isAuthenticated, isOwner, deleteUser)

export default userRouter
