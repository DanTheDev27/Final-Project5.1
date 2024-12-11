const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const Course = require('./models/course'); 
const authRoutes = require('./routes/authRoutes');
const cookieParser = require('cookie-parser');
const { requireAuth, checkUser } = require('./middleware/authMiddleware');

// express app
const app = express();


// connect to mongodb 
// DO NOT UNDER AN CIRCUMSTANCE CHANGE THE CONST dbURI! Or give out the password. Seriously.
const dbURI = 'mongodb+srv://net-ninja:pass123@cluster0.ymr4b.mongodb.net/final-proj?retryWrites=true&w=majority&appName=Cluster0';

// kanes login 
// 'mongodb+srv://netbinja:Work5678@cluster0.1xlo7.mongodb.net/note-dots?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(dbURI)
    .then((result) => app.listen(3000))
    .catch((err) => console.log(err));

// register view engine
app.set('view engine', 'ejs');

// middleware & static files
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());
app.use(authRoutes);

// routes with authentication

//checkuser
// app.get('*',checkUser);

app.get('/', requireAuth, (req,res) => {
    res.redirect('/courses');
})

// app.get('/about', requireAuth, (req, res) => {
//         res.render('about', { title: 'About' });
// });

// app.get('/login', requireAuth, (req,res) => {
//     res.render('login', {title:'About'});
// });

// app.get('/signup', requireAuth, (req,res) => {
//     res.render('signup', {title: 'About'});
// });


// app.get('/', (req, res) => {
//     res.redirect('/courses');
// });

app.get('/about', (req, res) => {
    res.render('about', { title: 'About' });
});

app.get('/login', (req,res) => {
    res.render('login', {title:'Login'});
});

app.get('/signup', (req,res) => {
    res.render('signup', {title: 'Signup'});
});

// course routes
app.get('/courses/create', (req, res) => {
    res.render('create-course', { title: 'Create a new Course' }); 
});

app.get('/courses', (req, res) => {
    Course.find().sort({ createdAt: -1 })
        .then((result) => {
            res.render('index', { title: 'All Courses', courses: result }); 
        })
        .catch((err) => {
            console.log(err);
        });
});

// Route to get the edit form for a specific course
app.get('/courses/:id/edit', (req, res) => {
    const id = req.params.id;
    Course.findById(id)
        .then(result => {
            res.render('edit-course', { title: 'Edit Course', course: result }); 
        })
        .catch(err => {
            console.log(err);
        });
});

// Route to handle the update request
app.post('/courses/:id', (req, res) => {
    const id = req.params.id;
    Course.findByIdAndUpdate(id, req.body)
        .then(result => {
            res.redirect('/courses/' + id); // Changed path
        })
        .catch(err => {
            console.log(err);
        });
});

app.post('/courses', (req, res) => {
    const course = new Course(req.body); 

    course.save()
        .then((result) => {
            res.redirect('/courses'); // Changed path
        })
        .catch((err) => {
            console.log(err);
        });
});

app.get('/courses/:id', (req, res) => {
    const id = req.params.id;
    Course.findById(id)
        .then((result) => {
            res.render('details', { course: result, title: 'Course Details' }); // Changed context
        })
        .catch((err) => {
            console.log(err);
        });
});

app.delete('/courses/:id', (req, res) => {
    const id = req.params.id;

    Course.findByIdAndDelete(id) 
        .then((result) => {
            res.json({ redirect: '/courses' }); // Changed path
        })
        .catch((err) => {
            console.log(err);
        });
});

// 404 page
app.use((req, res) => {
    res.status(404).render('404', { title: '404' });
});


