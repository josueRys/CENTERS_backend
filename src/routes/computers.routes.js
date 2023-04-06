import { Router } from "express";
import { createComputer, deleteComputer, readComputer, readComputers, updateComputer } from "../controllers/computers.controllers.js";

const router = Router()

router.post('/computers',createComputer)
router.get('/computers',readComputers)
router.get('/computers/:id',readComputer)
router.patch('/computers/:id',updateComputer)
router.delete('/computers/:id',deleteComputer)

export default router