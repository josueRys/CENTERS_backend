import { Router } from "express";
import { createUser, deleteUser,  login,  logout,  readUser, readUsers, updateUser } from "../controllers/users.controllers.js";

const router = Router()

router.post('/login', login )
router.post('/logout', logout)
router.post('/users',createUser)
router.get('/users', readUsers)
router.get('/users/:id', readUser)
router.patch('/users/:id', updateUser)
router.delete('/users/:id', deleteUser)

export default router