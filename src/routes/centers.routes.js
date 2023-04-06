import { Router } from "express";
import { createCenter, deleteCenter, readCenter, readCenters, updateCenter } from "../controllers/centers.controllers.js";

const router = Router()

router.post('/centers',createCenter)
router.get('/centers',readCenters)
router.get('/centers/:id',readCenter)
router.patch('/centers/:id',updateCenter)
router.delete('/centers/:id',deleteCenter)

export default router