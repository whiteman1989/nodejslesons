const {Router} = require('express');
const Course = require('../models/course');
const { isNullOrUndefined } = require('util');
const auth = require('../middleware/auth');
const router = Router();

const mongooseToObj = (doc) => {
    if (doc == null) {return null;}
    return doc.toObject();
}

const multiplemongooseToObjs = (arrayOfMongooseDocuments) => {
    const tempArray = [];
    if (arrayOfMongooseDocuments.length !== 0){
        arrayOfMongooseDocuments.forEach(doc => {
            tempArray.push(doc.toObject());
        });
    }
    // console.log(tempArray);
    return tempArray;
}

function isOwner(course, req) {
    return course.userId.toString() === req.user._id.toString();
}

router.get('/', async (req, res) => {
    try {
        const courses = await Course.find()
        .populate('userId', 'email name')
        .select('price title img');
        res.render('courses', {
            title: "Courses",
            isCourses: true,
            userId: req.user ? req.user._id.toString() : null,
            courses: multiplemongooseToObjs(courses)
        });
    } catch (e) {
        console.log(e);
    }

})

router.get('/:id', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id)
        res.render('course', {
            layout: 'empty',
            title: `Cours ${course.title}`,
            course: mongooseToObj(course)
        })
    } catch (e) {
        console.log(e);
    }
})

router.get('/:id/edit', auth, async (req, res) => {
    if (!req.query.allow){ 
        return res.redirect('/');
    }

    try {
        const course = await Course.findById(req.params.id);

        if (!isOwner(course, req)) {
            return res.redirect('/courses');
        }

        res.render('course-edit', {
                title: `Edit course ${course.title}`,
                course: mongooseToObj(course)
        })
    } catch (e) {
        console.log(e);
    }
})

router.post('/remove', auth, async (req, res) => {
    try{
        await Course.deleteOne({
        _id: req.body.id,
        userId: req.user._id
        })
        res.redirect('/courses');
    } catch (e) {
        console.log(e);
    }

})

router.post('/edit', auth, async (req, res) => {
    try {
        const {id} = req.body;
        delete req.body.id;
        const course = await Course.findById(id);
        if (!isOwner(course, req)) {
            return res.redirect('/courses');
        }
        Object.assign(course, req.body);
        await course.save();
        //await Course.findByIdAndUpdate(id, req.body);
        res.redirect('/courses');
    } catch (e) {
        console.log(e);
    }

})

module.exports = router;