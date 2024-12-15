const User = require('../models/User');
const jwt = require('jsonwebtoken');

// handle errors
const handleErrors = (err) => {
    console.log(err.message, err.code);
    let errors = {email: '', password: ''};

    // incorrect email
    if (err.message === 'incorrect email') {
        errors.email = 'that email is not registered';
    }

    // incorrect password
    if (err.message === 'incorrect password') {
        errors.password = 'that password is incorrect';
    }

    // duplicate error code
    if (err.code === 11000){
        errors.email = 'that email is already registered';
        return errors;
    }

    // validation errors
    if(err.message.includes('user validation failed')) {
        Object.values(err.errors).forEach(({properties}) => {
            errors[properties.path] = properties.message;
        })
    }
    return errors;
}

const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
    return jwt.sign({ id }, 'net ninja secret', {
        expiresIn: maxAge
    });
}

module.exports.signup_get = (req, res) => {
    res.render('signup', {title: 'Sign up', user: res.locals.user});
}

module.exports.login_get = (req, res) => {
    res.render('login', {title: 'Login', user: res.locals.user});
}

module.exports.signup_post = async(req, res) => {
    const { email, password, role } = req.body;

    try {
        // Attempt to create a new user
        const user = await User.create({ email, password, role });
        console.log(user);
        // Generate a JWT token after successful signup
        const token = createToken(user._id);

        // Set the JWT token as a cookie
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });


        // Return the user ID in the response
        // res.status(201).json({ user: user._id });
        return res.status(200).json({ redirect: '/login' });

    } catch (err) {
        // Handle validation errors and other issues
        const errors = handleErrors(err);
        res.status(400).json({ errors });  // Send back errors to frontend
    }

}

module.exports.login_post = async(req, res) => {
    const { email, password } = req.body;
    //login
    try {
        // if successful and have user we will grab it and return user id to console
        const user = await User.login(email, password);
        const token = createToken(user._id);
        res.cookie('jwt', token, {httpOnly: true, maxAge: maxAge * 1000 })
        res.status(200).json({ user: user._id})
    }
    catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({ errors });
    }
}

module.exports.logout_get = (req,res) => {
    res.cookie('jwt', '', {maxAge: 1});
    res.redirect('/');
}

// authController.js


