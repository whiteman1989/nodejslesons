const {Router} = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const router = Router();

router.get('/login', async (req, res) => {
    res.render('auth/login', {
        title: 'Login',
        isLogin: true,
        error: req.flash('error')
    })
})

router.post('/login', async(req, res) =>{
    try {
        const {email, password} = req.body;
        const candidate = await User.findOne({email});

        if (candidate) {
            const areSame = await bcrypt.compare(password, candidate.password);
            if (areSame) {
                const user = candidate;
                req.session.user = user;
                req.session.isAuthentificated = true;
                req.session.save(err => {
                    if (err) {
                        throw err;
                    }
                    res.redirect('/');
                })
            } else {
                res.redirect('/auth/login#login');
            }
        } else {
            req.flash('error', 'This user does not exeist');
            res.redirect('/auth/login#login');
        }
    } catch (e) {
        console.log(e);
    }


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
            req.flash('error', 'User with this email already exist');
            res.redirect('/auth/login#register');
        } else {
            const hashPassword = await bcrypt.hash(password, 10)
            const user = new User ({
                email, name, password: hashPassword, cart: {items: []}
            })
            await user.save();
            res.redirect('/auth/login#login');
        }
    } catch (e) {
        console.log(e);
    }
})

module.exports = router;