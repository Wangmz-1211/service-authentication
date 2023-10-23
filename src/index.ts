import express from 'express'
import BodyParser from 'body-parser'
import CookieParser from 'cookie-parser'
import cors from 'cors'
import mongoose from 'mongoose'
import userRouter from './route/user'
import cookieRefresher from './middlewares/cookieRefresher'

const app = express()
const port = 8081
// middlewares
app.use(cors({ credentials: true, origin: true }))
app.use(BodyParser.json())
app.use(CookieParser())
app.use(cookieRefresher)
// api routers
app.use('/api', userRouter)

app.listen(port, () => {
	console.log('Started express server at http://localhost:' + port + '/')
})

const MONGO_URL =
	'mongodb+srv://wangmz:wangmz@service-authentication.oy7g56g.mongodb.net/?retryWrites=true&w=majority'

mongoose
	.connect(MONGO_URL)
	.then(() => {
		console.log('connected to MongoDB')
	})
	.catch((err) => {
		console.log('some error occurs during connecting to MongoDB', err)
	})
