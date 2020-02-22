require('dotenv').config();
const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const _ = require('lodash');
const csrf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer');

const mongoDB = require('./utils/database');
const adminRoute = require('./routes/admin');
const shopRoute = require('./routes/shop');
const authRoute = require('./routes/auth');
const errorsController = require('./controllers/errors');
const User = require('./models/user');
const { cloudinaryConfig } = require('./config/cloudinaryConfig');

const app = express();

const port = 5000;

const store = new MongoDBStore({
    uri: process.env.MONGODB_URL,
    collection: 'sessions'
});

// const fileStorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, path.join('public', 'images'));
//     },
//     filename: (req, file, cb) => {
//         cb(null, Date.now() + '-' + file.originalname);
//     }
// });

const memoryStorage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

const upload = multer({ storage: memoryStorage, fileFilter: fileFilter });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(session({ secret: 's3cret', resave: false, saveUninitialized: false, store: store }));

app.use(cloudinaryConfig);

app.use(upload.single('image'));

app.use(csrf());

app.use(flash());

app.use((req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.use(express.static(path.join(__dirname, 'public')));

app.use('/500', errorsController.error500);

app.use((req, res, next) => {
    if (!_.get(req.session, 'user._id')) {
        return next();
    }
    User.findById(req.session.user._id)
        .then(user => {
            if (!user) {
                return next();
            }
            const username = _.get(user, 'username');
            const email = _.get(user, 'email');
            const cart = _.get(user, 'cart');
            const _id = _.get(user, '_id');
            req.user = new User(username, email, cart, _id);
            next();
        })
        .catch(err => {
            return next(new Error(err));
        });
});



app.set("view engine", "pug");
app.set("views", 'views');

app.use('/admin', adminRoute);
app.use('/shop', shopRoute);
app.use('/auth', authRoute);

app.get('/', (req, res, next) => {
    res.redirect('/shop');
});

app.use(errorsController.error404);

app.use((error, req, res, next) => {
    console.log(error);
    res.redirect('/500');
});

mongoDB.initialConnect(() => {
    app.listen(port, () => {
        console.log("Server is listening on port", port);
    });
});