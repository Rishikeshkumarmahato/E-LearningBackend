const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minLength: [3, 'Name must be at least 3 characters'],
    maxLength: [25, 'Name cannot exceed 25 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minLength: [6, 'Password must be at least 6 characters'],
    maxLength: [20, 'Password cannot exceed 20 characters']
  }
}, {
  timestamps: true
});

// Pre-save middleware to ensure email is lowercase
studentSchema.pre('save', function(next) {
  if (this.email) {
    this.email = this.email.toLowerCase();
  }
  next();
});

// Static method to find student by email (case insensitive)
studentSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

const Student = mongoose.model('Student', studentSchema);

module.exports = Student; 