const {Router} = require('express');
const User = require('../models/user');
const router = Router();

router.get('/login', async (req, res) => {
    res.render('auth/login', {
        title: 'Login',
        isLogin: true
    })
})

router.post('/login', async(req, res) =>{
    const user = await User.findById('5f0b53aed4d3294870b181df');
    req.session.user = user;
    req.session.isAuthentificated = true;
    req.session.save(err => {
        if (err) {
            throw err;
        }
        res.redirect('/');
    })
})

router.get('/logout', async (req, res) => {
    req.session.destroy(() => {
        res.redirect('/auth/login#login');
    })
})

router.post('/register', async (req, res)=> {
    try {
        const {email, password, repeat, name } = req.body;
        const candidate = await User.findOne({email});

        if (candidate) {
            res.redirect('/auth/login#register');
        } else {
            const user = new User ({
                email, name, password, cart: {items: []}
            })
            await user.save();
            res.redirect('/auth/login#login');
        }
    } catch (e) {
        console.log(e);
    }
})

module.exports = router;