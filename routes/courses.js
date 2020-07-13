const {Router} = require('express');
const Course = require('../models/course');
const { isNullOrUndefined } = require('util');
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

router.get('/', async (req, res) => {
    const courses = await Course.find()
    .populate('userId', 'email name')
    .select('price title img');
    res.render('courses', {
        title: "Courses",
        isCourses: true,
        courses: multiplemongooseToObjs(courses)
    });
})

router.get('/:id', async (req, res) => {
    const course = await Course.findById(req.params.id)
    res.render('course', {
        layout: 'empty',
        title: `Cours ${course.title}`,
        course: mongooseToObj(course)
    })
})

router.get('/:id/edit', async (req, res) => {
    if (!req.query.allow){ 
        return res.redirect('/');
    }

    const course = await Course.findById(req.params.id);

    res.render('course-edit', {
            title: `Edit course ${course.title}`,
            course: mongooseToObj(course)
    })
})

router.post('/remove', async (req, res) => {
    try{
        await Course.deleteOne({
        _id: req.body.id
        })
        res.redirect('/courses');
    } catch (e) {
        console.log(e);
    }

})

router.post('/edit', async (req, res) => {
    const {id} = req.body;
    delete req.body.id;
    await Course.findByIdAndUpdate(id, req.body);
    res.redirect('/courses');
})

module.exports = router;