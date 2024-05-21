import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import noCache from "nocache";
import methodOverride from "method-override";
import cookieParser from "cookie-parser";
import session from "express-session";
import morgan from "morgan";
import { config } from "./src/config/envConfig.js";
import Connection from "./src/config/dbConfig.js";
import adminRoutes from "./src/routes/adminRoutes/adminRoutes.js";
import customerRoutes from "./src/routes/customerRoutes/customerRoutes.js";
import customError from "./src/middlewares/errorMiddleware.js";

const app = express();

// Get current file path and directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Set port and view engine
app.set("port", config.port || 3000);
app.set("views", path.join(__dirname, "src", "views"));
app.set("view engine", "ejs");

// Middleware setup
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(noCache());
app.use(helmet());
app.use(cookieParser());

// Rate limiter
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Logging middleware
const accessLogStream = fs.createWriteStream(path.join(__dirname, "console.log"), {
    flags: "a",
    maxsize: 10 * 1024 * 1024 // 10 MB maximum size
});
app.use(morgan("common", { stream: accessLogStream }));

// Session configuration
app.use(session({
    secret: config.secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: 60000 * 60 * 24 * 7 // 1 week
    }
}));

// Routes
app.use("/", customerRoutes);
app.use("/admin", adminRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).render("error/404");
});

// Error handling middleware
app.use(customError);

// Database connection and server startup
const startServer = async () => {
    try {
        await Connection();
        app.listen(app.get("port"), () => {
            console.log(`Server is running on port ${app.get("port")}`);
        });
    } catch (error) {
        console.error("Failed to connect to the database", error);
        process.exit(1);
    }
};

startServer();
