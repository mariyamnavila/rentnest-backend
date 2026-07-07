import express, { Application, Request, Response } from "express";
import cors from 'cors';
import config from "./config";
import cookieParser from "cookie-parser";
import { authRouter } from "./modules/auth/auth.route";
import { adminRouter } from "./modules/admin/admin.route";
import { landlordRouter } from "./modules/landlord/landlord.route";
import { categoryRouter } from "./modules/category/category.route";
import { propertyRouter } from "./modules/property/property.route";
import { notFound } from "./middleware/notFound";
import { globalErrorHandler } from "./middleware/globalErrorHandler";

const app: Application = express();

app.use(cors({
    origin: config.app_url,
    credentials: true
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.get("/", async (req: Request, res: Response) => {
    res.send("Hello,  world")
})

app.use("/api/auth", authRouter)
app.use("/api/admin", adminRouter)
app.use("/api/landlord", landlordRouter)
app.use("/api/categories", categoryRouter)
app.use("/api/properties", propertyRouter)

app.use(notFound)
app.use(globalErrorHandler)

export default app;