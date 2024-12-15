const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const Course = require('./models/course');
const User = require('./models/User');
const authRoutes = require('./routes/authRoutes');
const cookieParser = require('cookie-parser');
const { requireAuth, checkUser } = require('./middleware/authMiddleware');

// express app
const app = express();

// connect to mongodb 
// DO NOT UNDER AN CIRCUMSTANCE CHANGE THE CONST dbURI! Or give out the password. Seriously.
const dbURI = 'mongodb+srv://net-ninja:pass123@cluster0.ymr4b.mongodb.net/final-proj?retryWrites=true&w=majority&appName=Cluster0';

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
app.use(checkUser);
app.use((req, res, next) => {
    res.locals.user = req.user || null;  // This will set `user` to `req.user` if it's available, otherwise it will be null
    next();
});

// routes with authentication

//checkuser
app.get('*',checkUser);

app.get('/', requireAuth, (req,res) => {
    Course.find()
    .then((courses) => {
        res.render('index', {title: 'Home', courses: courses});
    })
    .catch((err) => {
        console.log(err);
        res.status(500).send('Error retrieving courses');
    });
    
});

app.get('/about', (req, res) => {
    res.render('about', { title: 'About' });
});

app.get('/login', (req,res) => {
    res.render('login', {title:'Login'});
});

app.get('/signup', (req,res) => {
    User.find()
    res.redirect('/login');
});

app.get('logout', (req, res) => {
    User.find()
    res.redirect('/')
});

app.post('/signup', async (req, res) => {
    const { email, password, role } = req.body;

    console.log('Received user data:', { email, password, role }); // Log the data

    if (!role) {
        return res.status(400).json({ errors: { role: 'Role is required' } });
    }

    try {
        const user = new User({ email, password, role });
        await user.save();  // Save user to DB
        res.status(200).json({ user }); // Send back the saved user
    } catch (err) {
        console.log(err);  // Log any errors during the save operation
        res.status(500).json({ error: 'Error saving user' });
    }
});


app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).json({ errors: { email: 'Email not found' } });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ errors: { password: 'Incorrect password' } });
    }

    // Set the user in the session or token (for simplicity, here we use a cookie)
    req.session.userId = user._id;

    // Redirect based on role
    if (user.role === 'teacher') {
        return res.json({ user, redirect: '/teacher-dashboard' });  // Teacher dashboard route
    } else {
        return res.json({ user, redirect: '/courses' });  // Student courses route
    }
});
app.get('/teacher-dashboard', requireAuth, (req, res) => {
    // Only allow access to teachers
    if (req.user.role !== 'teacher') {
        return res.status(403).send('Forbidden');
    }

    res.render('teacher-dashboard', { title: 'Teacher Dashboard' });
});


// course routes
app.get('/courses/create', requireAuth,(req, res) => {
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
    console.log(req.body);
    const course = new Course(req.body); 

    course.save()
        .then((result) => {
            res.redirect('/courses'); // Changed path
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send('Error saving course');
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


