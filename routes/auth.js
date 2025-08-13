const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Student = require('../models/Student');

// @route   POST api/auth/register
// @desc    Register a student
// @access  Public
router.post('/register', [
  check('name', 'Name is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { 
    name, 
    email, 
    password, 
    age,
    studentType,
    learningStyle, 
    difficultyPreference,
    preferredSubjects,
    schoolDetails,
    collegeDetails
  } = req.body;

  // Debug logging
  console.log('Registration request body:', {
    name,
    email,
    age,
    studentType,
    hasSchoolDetails: !!schoolDetails,
    hasCollegeDetails: !!collegeDetails
  });

  try {
    // Check if student already exists
    let student = await Student.findOne({ email });
    if (student) {
      return res.status(400).json({ msg: 'Student already exists' });
    }

    // Validate required fields
    if (!age || !studentType) {
      return res.status(400).json({ 
        msg: 'Age and student type are required',
        errors: [
          ...(!age ? [{ field: 'age', message: 'Age is required' }] : []),
          ...(!studentType ? [{ field: 'studentType', message: 'Student type is required' }] : [])
        ]
      });
    }

    // Create new student with updated schema
    const studentData = {
      name,
      email,
      password,
      age: parseInt(age) || 18,
      studentType: studentType,
      learningStyle: learningStyle || { visual: 0.33, auditory: 0.33, kinesthetic: 0.34 },
      difficultyPreference: difficultyPreference || 5,
      preferredSubjects: preferredSubjects || []
    };

    // Add school or college details based on student type
    if (studentType === 'school') {
      studentData.schoolDetails = schoolDetails || {
        class: '9',
        board: 'CBSE',
        medium: 'English',
        subjects: [],
        examPreparation: { neet: false, jee: false, other: [] }
      };
    } else if (studentType === 'college') {
      studentData.collegeDetails = collegeDetails || {
        degree: '',
        branch: '',
        year: 1,
        technologies: [],
        careerGoals: [],
        learningObjectives: []
      };
    }

    student = new Student(studentData);

    // Hash password
    const salt = await bcrypt.genSalt(10);
    student.password = await bcrypt.hash(password, salt);

    await student.save();

    // Create JWT token
    const payload = {
      student: {
        id: student.id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({ token, student: { id: student.id, name: student.name, email: student.email } });
      }
    );
  } catch (err) {
    console.error('Registration Error:', err);
    res.status(500).json({ 
      msg: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
});

// @route   POST api/auth/login
// @desc    Authenticate student & get token
// @access  Public
router.post('/login', [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    // Check if student exists
    let student = await Student.findOne({ email });
    if (!student) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Update last active
    student.lastActive = new Date();
    await student.save();

    // Create JWT token
    const payload = {
      student: {
        id: student.id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({ token, student: { id: student.id, name: student.name, email: student.email } });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/auth/me
// @desc    Get current student
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const student = await Student.findById(req.student.id).select('-password');
    res.json(student);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/auth/profile
// @desc    Update student profile
// @access  Private
router.put('/profile', auth, async (req, res) => {
  const { 
    name, 
    age,
    studentType,
    preferredSubjects, 
    learningStyle, 
    difficultyPreference,
    schoolDetails,
    collegeDetails
  } = req.body;

  try {
    const student = await Student.findById(req.student.id);
    if (!student) {
      return res.status(404).json({ msg: 'Student not found' });
    }

    // Update basic fields
    if (name) student.name = name;
    if (age) student.age = parseInt(age);
    if (studentType) student.studentType = studentType;
    if (preferredSubjects) student.preferredSubjects = preferredSubjects;
    if (learningStyle) student.learningStyle = learningStyle;
    if (difficultyPreference) student.difficultyPreference = difficultyPreference;

    // Update school or college details
    if (studentType === 'school' && schoolDetails) {
      student.schoolDetails = { ...student.schoolDetails, ...schoolDetails };
    } else if (studentType === 'college' && collegeDetails) {
      student.collegeDetails = { ...student.collegeDetails, ...collegeDetails };
    }

    await student.save();
    res.json(student);
  } catch (err) {
    console.error('Profile Update Error:', err);
    res.status(500).json({ 
      msg: 'Server error during profile update',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
});

module.exports = router;
