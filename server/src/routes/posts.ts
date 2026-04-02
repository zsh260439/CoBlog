import express from 'express'
import Post from '../models/Post'

const router = express.Router()

// Get all posts
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 })
    res.json(posts)
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
})

// Get single post
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    if (!post) return res.status(404).json({ message: 'Post not found' })
    res.json(post)
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
})

// Create post
router.post('/', async (req, res) => {
  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    excerpt: req.body.excerpt,
    category: req.body.category,
    tags: req.body.tags,
    coverImage: req.body.coverImage,
  })

  try {
    const newPost = await post.save()
    res.status(201).json(newPost)
  } catch (err: any) {
    res.status(400).json({ message: err.message })
  }
})

export default router
