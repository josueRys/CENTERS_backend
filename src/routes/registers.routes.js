import { Router } from "express";
import { createRegister, deleteRegister, readRegister, readRegisters, updateRegister } from "../controllers/registers.controller.js";

const router = Router()

router.post('/registers',createRegister)
router.get('/registers',readRegisters)
router.get('/registers/:id',readRegister)
router.patch('/registers/:id',updateRegister)
router.delete('/registers/:id',deleteRegister)

export default router