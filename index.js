import express from "express";
import dotenv from "dotenv";
dotenv.config();
import noCache from "nocache";
import methodOverride from "method-override";
import cookieParser from "cookie-parser";
import session from "express-session";
import Connection from "./database/db.js";
import adminRoutes from "./routes/adminRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import customError from "./middlewares/errorMiddleware.js";

const app = express();

app.set("port", process.env.PORT || 3000);
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(methodOverride("_method"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(noCache());
app.use(cookieParser());
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,    
    cookie: {
        expires: 60000 * 60 * 24 * 7
    }
}));

app.use("/", customerRoutes);
app.use("/admin", adminRoutes);

app.use((req, res) => {
    res.render("error/404");
});

app.use(customError);

Connection();

app.listen(app.get("port"), () => {
    console.log(`Server is running on port ${app.get("port")}`);
});
