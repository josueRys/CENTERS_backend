import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import usersRoutes from "./routes/users.routes.js";
import registersRoutes from "./routes/registers.routes.js"
import centersRoutes from "./routes/centers.routes.js"
import computersRoutes from "./routes/computers.routes.js"

const app = express()

app.use(cookieParser())
app.use(cors())
app.use(express.json())

app.use('/api',usersRoutes)
app.use('/api',centersRoutes)
app.use('/api',registersRoutes)
app.use('/api',computersRoutes)

app.use((req, res, next) => {
    res.status(404).json({ messaje: 'ENDPOINT NOT FOUND' })
})

export default app
