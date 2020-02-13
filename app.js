const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const _ = require('lodash');

const mongoDB = require('./utils/database');
const adminRoute = require('./routes/admin');
const shopRoute = require('./routes/shop');
const errorsController = require('./controllers/errors');

const User = require('./models/user');

const app = express();

const port = 5000;

app.use((req, res, next) => {
    User.findById("5e444d9d89319a581fb669db")
        .then(user => {
            req.user = new User(user.username, user.email, user.cart, user._id);
            next();
        })
        .catch(err => console.log(err))
});

app.use(express.static(path.join(__dirname, 'public')));

app.set("view engine", "pug");
app.set("views", 'views');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/admin', adminRoute);
app.use('/shop', shopRoute);

app.get('/', (req, res, next) => {
    res.redirect('/shop');
});

app.use(errorsController.error404);

// app.listen(port, () => {
//     console.log("Server is litening on port", port);
// });

mongoDB.initialConnect(() => {
    app.listen(port, () => {
        console.log("Server is listening on port", port);
    });
});
