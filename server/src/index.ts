import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import dotenv from 'dotenv'

import postRoutes from './routes/posts'

dotenv.config()

const app = express()
const port = process.env.PORT || 3000

// Connect to MongoDB
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/devblog'
mongoose.connect(mongoUri)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err))

app.use(cors())
app.use(express.json())

app.use('/api/posts', postRoutes)

app.get('/', (req, res) => {
  res.send('DevBlog API is running')
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
