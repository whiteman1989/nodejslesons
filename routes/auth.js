const {Router} = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/user');
const sendmail = require('../emails/sendmail');
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
            await sendmail.sendRegMail(user);
        }
    } catch (e) {
        console.log(e);
    }
})

router.get('/reset', (req, res) => {
    res.render('auth/reset', {
        title: 'Reset password',
        error: req.flash('error')
    })
})

router.post('/reset', async (req, res) =>{
    try {
        crypto.randomBytes(32, async (err, buffer) => {
            if (err) {
                req.flash('error', 'Something went wrong, please try again later');
                return res.redirect('/auth/reset');
            }

            const token = buffer.toString('hex');
            const candidate = await User.findOne({email: req.body.email});
            if (candidate) {
                candidate.resetToken = token;
                candidate.resetTokenExp = Date.now() + 60*60*1000;
                await candidate.save();
                await sendmail.sendResMail(candidate);
                res.redirect('/auth/login');
            } else {
                req.flash('error', 'Email not found');
                res.redirect('/auth/reset');
            }
        })
        
    } catch (e) {
        console.log(e);
    }
})

router.get('/password/:token', async (req, res) => {
    if (!req.params.token){
        return res.redirect('/auth/login');
    }

    try {
        const user = await User.findOne({
            resetToken: req.params.token,
            resetTokenExp: {$gt: Date.now()}
        })

        if(!user) {
            return res.redirect('/auth/login');
        } else {
            res.render('auth/password', {
                title: 'new password',
                error: req.flash('error'),
                userId: user._id.toString(),
                token: req.params.token
            })
        }
    } catch (e) {
        console.log(e);
    }

})

router.post('/password', async (req, res) => {
    try {
        const user = await User.findOne({
            _id: req.body.userId,
            resetToken: req.body.token,
            resetTokenExp: {$gt: Date.now()}
        })

        if (user) {
            user.password = await bcrypt.hash(req.body.password, 10);
            user.resetToken = undefined;
            user.resetTokenExp = undefined;
            await user.save();
            res.redirect('/auth/login');
        } else {
            req.flash('error', 'token expired')
            res.redirect('/auth/login');
        }
    } catch (e) {
       console.log(e); 
    }
})

module.exports = router;