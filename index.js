import express from 'express';
import dotenv from "dotenv";
import noCache from 'nocache';
import methodOverride from 'method-override';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import Connection from './database/db.js';
import adminRoutes from './routes/adminRoutes.js';
import customerRoutes from './routes/customerRoutes.js';

dotenv.config();

const app = express();

app.set('port', process.env.PORT || 3000);
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: true }));
app.use(noCache());
app.use(cookieParser());
app.use(session({
    secret: process.env.SECRETE,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: 600000
    }
}));

app.use("/", customerRoutes);
app.use("/admin", adminRoutes);

app.use((req, res) => {
    res.render("404");
});

Connection();

app.listen(app.get('port'), () => {
    console.log(`Server is running on port ${app.get('port')}`);
});