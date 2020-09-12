const {Router} = require('express');
const Order = require('../models/order');
const { totalmem } = require('os');
const auth = require('../middleware/auth');
const router = Router();

router.get('/', auth, async (req, res) =>{
    try {
        const orders = await Order.find({'user.userId': req.user._id})
            .populate('user.userId');

        //console.log(orders);
        //console.log(orders[0].user);

        const newOrders =  orders.map(o => {
            return {
                _id: o._id,
                date: o.date,
                courses: o.courses.map(c => ({
                    ...c._doc
                })),
                user: {
                    ...o.user.userId._doc
                },
                price: o.courses.reduce((total, c) => {
                    return total += c.count * c.course.price;
                }, 0)
            }
        })

        //console.log(newOrders[0].date);
            
        res.render('orders', {
            isOrders: true,
            title: 'Orders',
            orders: newOrders
        })
    } catch (e) {
        console.log(e);
    }

})

router.post('/',  auth, async (req, res) =>{
    try {
        const user = await req.user
            .populate('cart.items.courseId')
            .execPopulate();

        const courses = user.cart.items.map(i => ({
            count: i.count,
            course: {...i.courseId._doc}
        }))

        const order = new Order ({
            user: {
                //name: req.user.name,
                userId: req.user
            },
            courses: courses
        })

        await order.save();
        await req.user.clearCart();

        res.redirect('/orders');
    } catch (e) {
        console.log(e);
    }
    
})

module.exports = router;