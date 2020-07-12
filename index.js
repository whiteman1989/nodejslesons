const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const exphbs = require('express-handlebars');
const homeRoutes = require('./routes/home');
const coursesRoutes = require('./routes/courses');
const addRoutes = require('./routes/add');
const aboutRoutes = require('./routes/about');
const cartRouters = require('./routes/cart');
const { Mongoose } = require('mongoose');
const { url } = require('inspector');
const User = require('./models/user');

const pass= 'kZ790wRXUAwj2GYZ';
const mongoUrl= `mongodb+srv://whiteman1989:${pass}@cluster0.h8pme.mongodb.net/shop`;
const app = express();
const PORT = process.env.PORT || 3000;
const hbs = exphbs.create({
    defoultLayout: 'main',
    extname:'hbs'
})

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', 'views');

app.use(async (req, res, next) => {
    try{
        const user = await User.findById('5f0b53aed4d3294870b181df');
        req.user = user;
        next();
    } catch(e){
        console.log(e);
    }
})

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({extended: true}));
app.use('/',homeRoutes);
app.use('/courses',coursesRoutes);
app.use('/add',addRoutes);
app.use('/about',aboutRoutes);
app.use('/cart', cartRouters);



async function start() {
    try {
            await mongoose.connect(mongoUrl, {
                useUnifiedTopology: true,
                useNewUrlParser: true
            })
            const candidate = await User.findOne();
            if(!candidate){
                const user = new User({
                    email: 'whiteman1989@gmail.com',
                    name: 'Whiteman',
                    cart: {items:[]}
                })
                await user.save();
            }
            app.listen(PORT, () => {
                console.log(`Server is run on port ${PORT}`);
        })
    } catch(e) {
        console.log(e);
    }
}

start();



