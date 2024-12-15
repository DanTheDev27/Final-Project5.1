const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Course title is required']
    },
    description: {  // Changed snippet to description
        type: String,
        required: [true, 'Course description is required']
    },
    duration: {  // Changed body to duration
        type: String,
        required: [true, 'Course duration is required']
    }
}, { timestamps: true });

const Course = mongoose.model('Course', courseSchema);  // Changed model name to Course
module.exports = Course;

