import express from 'express'
import { shouldBeAdmin, shouldLoggedIn } from '../controllers/test.controller.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router()

router.get('/should-be-logged-in' , verifyToken , shouldLoggedIn)
router.get('/should-be-admin' , shouldBeAdmin)

export default router;