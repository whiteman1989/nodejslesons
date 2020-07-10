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

const pass= 'kZ790wRXUAwj2GYZ';
const mongoUrl= `mongodb+srv://whiteman1989:${pass}@cluster0.h8pme.mongodb.net/<dbname>?retryWrites=true&w=majority`;
const app = express();
const PORT = process.env.PORT || 3000;
const hbs = exphbs.create({
    defoultLayout: 'main',
    extname:'hbs'
})

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', 'views');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({extended: true}));
app.use('/',homeRoutes);
app.use('/courses',coursesRoutes);
app.use('/add',addRoutes);
app.use('/about',aboutRoutes);
app.use('/cart', cartRouters);



async function start() {
    try {
            await mongoose.connect(mongoUrl, {useNewUrlParser: true})
            app.listen(PORT, () => {
                console.log(`Server is run on port ${PORT}`);
        })
    } catch(e) {
        console.log(e);
    }
}

start();



