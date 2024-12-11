const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const courseSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {  // Changed snippet to description
        type: String,
        required: true
    },
    duration: {  // Changed body to duration
        type: String,
        required: true
    }
}, { timestamps: true });

const Course = mongoose.model('Course', courseSchema);  // Changed model name to Course
module.exports = Course;

