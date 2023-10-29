import express from 'express'
import BodyParser from 'body-parser'
import CookieParser from 'cookie-parser'
import cors from 'cors'
import mongoose from 'mongoose'
import userRouter from './route/user'
import cookieRefresher from './middlewares/cookieRefresher'

/* this variable must be set by env variable */
const MONGO_URL = process.env.MONGO_URL
if( !MONGO_URL ) throw new Error('MONGO_URL environment variable is necessary!')

const app = express()
const port = 3000
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


mongoose
	.connect(MONGO_URL)
	.then(() => {
		console.log('connected to MongoDB')
	})
	.catch((err) => {
		console.log('some error occurs during connecting to MongoDB', err)
	})
