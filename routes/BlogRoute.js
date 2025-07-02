import express from 'express';
import { createPost, deletePost, getAllPosts, getPostById, updatePost } from '../controller/BlogController.js';

const router = express.Router();

// Public
router.get('/get-all-blogs', getAllPosts);
router.get('/:id', getPostById);

// Protected (add your auth middleware before these if needed)
router.post('/add-blog', createPost);
router.put('/:id', updatePost);
router.delete('/:id', deletePost);

export default router;
