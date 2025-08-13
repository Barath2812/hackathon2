// Comprehensive Syllabus Datasets for AI Learning Planner

const syllabusDatasets = {
  // CBSE Syllabus Data
  cbse: {
    '9': {
      subjects: {
        'Mathematics': {
          description: 'Advanced mathematical concepts and problem-solving',
          weightage: 25,
          units: [
            {
              title: 'Number Systems',
              description: 'Real numbers, rational and irrational numbers',
              topics: [
                'Real Numbers',
                'Rational Numbers',
                'Irrational Numbers',
                'Decimal Expansions',
                'Operations on Real Numbers'
              ],
              estimatedDuration: 20,
              order: 1
            },
            {
              title: 'Algebra',
              description: 'Polynomials, linear equations, and quadratic equations',
              topics: [
                'Polynomials',
                'Linear Equations in Two Variables',
                'Quadratic Equations',
                'Arithmetic Progressions'
              ],
              estimatedDuration: 30,
              order: 2
            },
            {
              title: 'Geometry',
              description: 'Coordinate geometry and geometric constructions',
              topics: [
                'Coordinate Geometry',
                'Lines and Angles',
                'Triangles',
                'Circles',
                'Constructions'
              ],
              estimatedDuration: 25,
              order: 3
            },
            {
              title: 'Mensuration',
              description: 'Areas and volumes of geometric figures',
              topics: [
                'Areas of Parallelograms and Triangles',
                'Surface Areas and Volumes',
                'Statistics'
              ],
              estimatedDuration: 20,
              order: 4
            }
          ],
          totalHours: 95
        },
        'Science': {
          description: 'Physics, Chemistry, and Biology fundamentals',
          weightage: 25,
          units: [
            {
              title: 'Matter - Its Nature and Behaviour',
              description: 'Physical and chemical properties of matter',
              topics: [
                'Matter in Our Surroundings',
                'Is Matter Around Us Pure',
                'Atoms and Molecules',
                'Structure of the Atom'
              ],
              estimatedDuration: 25,
              order: 1
            },
            {
              title: 'Organisation in the Living World',
              description: 'Cell biology and living organisms',
              topics: [
                'The Fundamental Unit of Life',
                'Tissues',
                'Diversity in Living Organisms',
                'Why Do We Fall Ill'
              ],
              estimatedDuration: 30,
              order: 2
            },
            {
              title: 'Motion, Force and Work',
              description: 'Physics concepts and laws',
              topics: [
                'Motion',
                'Force and Laws of Motion',
                'Gravitation',
                'Work and Energy',
                'Sound'
              ],
              estimatedDuration: 35,
              order: 3
            },
            {
              title: 'Our Environment',
              description: 'Environmental science and natural resources',
              topics: [
                'Natural Resources',
                'Improvement in Food Resources'
              ],
              estimatedDuration: 15,
              order: 4
            }
          ],
          totalHours: 105
        },
        'English': {
          description: 'Language skills, literature, and communication',
          weightage: 20,
          units: [
            {
              title: 'Reading Comprehension',
              description: 'Understanding and analyzing texts',
              topics: [
                'Reading Skills',
                'Comprehension Strategies',
                'Text Analysis',
                'Critical Reading'
              ],
              estimatedDuration: 20,
              order: 1
            },
            {
              title: 'Writing Skills',
              description: 'Essay writing and creative expression',
              topics: [
                'Essay Writing',
                'Letter Writing',
                'Story Writing',
                'Article Writing'
              ],
              estimatedDuration: 25,
              order: 2
            },
            {
              title: 'Grammar and Vocabulary',
              description: 'Language structure and word power',
              topics: [
                'Parts of Speech',
                'Tenses',
                'Voice and Narration',
                'Vocabulary Building'
              ],
              estimatedDuration: 20,
              order: 3
            },
            {
              title: 'Literature',
              description: 'Poetry, prose, and drama appreciation',
              topics: [
                'Poetry Analysis',
                'Prose Comprehension',
                'Drama Appreciation',
                'Literary Devices'
              ],
              estimatedDuration: 20,
              order: 4
            }
          ],
          totalHours: 85
        }
      }
    },
    '10': {
      subjects: {
        'Mathematics': {
          description: 'Advanced mathematical concepts for board examination',
          weightage: 25,
          units: [
            {
              title: 'Real Numbers',
              description: 'Number systems and fundamental theorem',
              topics: [
                'Real Numbers',
                'Euclid\'s Division Lemma',
                'Fundamental Theorem of Arithmetic',
                'Irrational Numbers'
              ],
              estimatedDuration: 15,
              order: 1
            },
            {
              title: 'Polynomials',
              description: 'Polynomial equations and their solutions',
              topics: [
                'Polynomials',
                'Zeroes of Polynomials',
                'Division Algorithm',
                'Geometric Meaning of Zeroes'
              ],
              estimatedDuration: 20,
              order: 2
            },
            {
              title: 'Pair of Linear Equations',
              description: 'Linear equations in two variables',
              topics: [
                'Linear Equations in Two Variables',
                'Graphical Method',
                'Algebraic Methods',
                'Word Problems'
              ],
              estimatedDuration: 25,
              order: 3
            },
            {
              title: 'Quadratic Equations',
              description: 'Quadratic equations and their applications',
              topics: [
                'Quadratic Equations',
                'Solution by Factorization',
                'Solution by Completing Square',
                'Quadratic Formula'
              ],
              estimatedDuration: 20,
              order: 4
            },
            {
              title: 'Arithmetic Progressions',
              description: 'Sequences and series',
              topics: [
                'Arithmetic Progressions',
                'nth Term',
                'Sum of n Terms',
                'Applications'
              ],
              estimatedDuration: 15,
              order: 5
            },
            {
              title: 'Triangles',
              description: 'Similarity and congruence of triangles',
              topics: [
                'Similar Triangles',
                'Basic Proportionality Theorem',
                'Pythagoras Theorem',
                'Applications'
              ],
              estimatedDuration: 20,
              order: 6
            },
            {
              title: 'Coordinate Geometry',
              description: 'Distance formula and section formula',
              topics: [
                'Distance Formula',
                'Section Formula',
                'Area of Triangle',
                'Applications'
              ],
              estimatedDuration: 15,
              order: 7
            },
            {
              title: 'Introduction to Trigonometry',
              description: 'Trigonometric ratios and identities',
              topics: [
                'Trigonometric Ratios',
                'Trigonometric Identities',
                'Applications',
                'Heights and Distances'
              ],
              estimatedDuration: 25,
              order: 8
            },
            {
              title: 'Circles',
              description: 'Properties of circles and tangents',
              topics: [
                'Tangent to a Circle',
                'Number of Tangents',
                'Properties of Tangents',
                'Applications'
              ],
              estimatedDuration: 15,
              order: 9
            },
            {
              title: 'Constructions',
              description: 'Geometric constructions',
              topics: [
                'Division of Line Segment',
                'Construction of Triangles',
                'Construction of Tangents',
                'Applications'
              ],
              estimatedDuration: 15,
              order: 10
            },
            {
              title: 'Areas Related to Circles',
              description: 'Areas of circles and sectors',
              topics: [
                'Perimeter and Area of Circle',
                'Areas of Sector and Segment',
                'Areas of Combinations',
                'Applications'
              ],
              estimatedDuration: 15,
              order: 11
            },
            {
              title: 'Surface Areas and Volumes',
              description: 'Surface areas and volumes of solids',
              topics: [
                'Surface Area of Cuboid and Cube',
                'Surface Area of Right Circular Cylinder',
                'Surface Area of Right Circular Cone',
                'Surface Area of Sphere',
                'Volume of Cuboid and Cube',
                'Volume of Cylinder',
                'Volume of Cone',
                'Volume of Sphere'
              ],
              estimatedDuration: 25,
              order: 12
            },
            {
              title: 'Statistics',
              description: 'Data analysis and probability',
              topics: [
                'Mean of Grouped Data',
                'Mode of Grouped Data',
                'Median of Grouped Data',
                'Graphical Representation',
                'Probability'
              ],
              estimatedDuration: 20,
              order: 13
            }
          ],
          totalHours: 250
        }
      }
    }
  },

  // NEET Preparation Syllabus
  neet: {
    subjects: {
      'Physics': {
        description: 'Medical entrance physics preparation',
        weightage: 25,
        units: [
          {
            title: 'Mechanics',
            description: 'Motion, forces, and energy',
            topics: [
              'Kinematics',
              'Laws of Motion',
              'Work, Energy and Power',
              'Circular Motion',
              'Gravitation'
            ],
            estimatedDuration: 40,
            order: 1
          },
          {
            title: 'Thermodynamics',
            description: 'Heat, temperature, and energy transfer',
            topics: [
              'Thermal Properties of Matter',
              'Laws of Thermodynamics',
              'Heat Transfer',
              'Kinetic Theory of Gases'
            ],
            estimatedDuration: 30,
            order: 2
          },
          {
            title: 'Electromagnetism',
            description: 'Electric and magnetic fields',
            topics: [
              'Electric Charges and Fields',
              'Electrostatic Potential',
              'Current Electricity',
              'Magnetic Effects of Current',
              'Electromagnetic Induction'
            ],
            estimatedDuration: 45,
            order: 3
          },
          {
            title: 'Optics',
            description: 'Light, reflection, and refraction',
            topics: [
              'Ray Optics',
              'Wave Optics',
              'Optical Instruments',
              'Dispersion and Scattering'
            ],
            estimatedDuration: 35,
            order: 4
          },
          {
            title: 'Modern Physics',
            description: 'Quantum mechanics and nuclear physics',
            topics: [
              'Photoelectric Effect',
              'Atomic Structure',
              'Nuclear Physics',
              'Radioactivity'
            ],
            estimatedDuration: 30,
            order: 5
          }
        ],
        totalHours: 180
      },
      'Chemistry': {
        description: 'Medical entrance chemistry preparation',
        weightage: 25,
        units: [
          {
            title: 'Physical Chemistry',
            description: 'Chemical kinetics and thermodynamics',
            topics: [
              'Chemical Kinetics',
              'Chemical Thermodynamics',
              'Solutions',
              'Surface Chemistry',
              'Electrochemistry'
            ],
            estimatedDuration: 40,
            order: 1
          },
          {
            title: 'Organic Chemistry',
            description: 'Carbon compounds and reactions',
            topics: [
              'Basic Principles',
              'Hydrocarbons',
              'Alcohols and Ethers',
              'Aldehydes and Ketones',
              'Carboxylic Acids',
              'Amines',
              'Biomolecules'
            ],
            estimatedDuration: 50,
            order: 2
          },
          {
            title: 'Inorganic Chemistry',
            description: 'Chemical bonding and coordination compounds',
            topics: [
              'Chemical Bonding',
              'Coordination Compounds',
              'd and f Block Elements',
              'Environmental Chemistry'
            ],
            estimatedDuration: 30,
            order: 3
          }
        ],
        totalHours: 120
      },
      'Biology': {
        description: 'Medical entrance biology preparation',
        weightage: 50,
        units: [
          {
            title: 'Diversity in Living World',
            description: 'Classification and biodiversity',
            topics: [
              'Living World',
              'Biological Classification',
              'Plant Kingdom',
              'Animal Kingdom'
            ],
            estimatedDuration: 25,
            order: 1
          },
          {
            title: 'Structural Organisation',
            description: 'Cell structure and organization',
            topics: [
              'Morphology of Flowering Plants',
              'Anatomy of Flowering Plants',
              'Structural Organisation in Animals'
            ],
            estimatedDuration: 30,
            order: 2
          },
          {
            title: 'Cell Structure and Function',
            description: 'Cell biology and molecular biology',
            topics: [
              'Cell: The Unit of Life',
              'Biomolecules',
              'Cell Cycle and Cell Division',
              'Transport in Plants',
              'Mineral Nutrition',
              'Photosynthesis',
              'Respiration in Plants',
              'Plant Growth and Development'
            ],
            estimatedDuration: 45,
            order: 3
          },
          {
            title: 'Human Physiology',
            description: 'Human body systems and functions',
            topics: [
              'Digestion and Absorption',
              'Breathing and Exchange of Gases',
              'Body Fluids and Circulation',
              'Excretory Products',
              'Locomotion and Movement',
              'Neural Control and Coordination',
              'Chemical Coordination and Integration'
            ],
            estimatedDuration: 50,
            order: 4
          },
          {
            title: 'Reproduction',
            description: 'Reproductive systems and development',
            topics: [
              'Reproduction in Organisms',
              'Sexual Reproduction in Flowering Plants',
              'Human Reproduction',
              'Reproductive Health'
            ],
            estimatedDuration: 30,
            order: 5
          },
          {
            title: 'Genetics and Evolution',
            description: 'Heredity and evolutionary biology',
            topics: [
              'Principles of Inheritance and Variation',
              'Molecular Basis of Inheritance',
              'Evolution'
            ],
            estimatedDuration: 35,
            order: 6
          },
          {
            title: 'Biology and Human Welfare',
            description: 'Health, disease, and biotechnology',
            topics: [
              'Human Health and Disease',
              'Strategies for Enhancement in Food Production',
              'Microbes in Human Welfare',
              'Biotechnology: Principles and Processes',
              'Biotechnology and Its Applications'
            ],
            estimatedDuration: 40,
            order: 7
          },
          {
            title: 'Biotechnology and Ecology',
            description: 'Environmental biology and conservation',
            topics: [
              'Organisms and Populations',
              'Ecosystem',
              'Biodiversity and Conservation',
              'Environmental Issues'
            ],
            estimatedDuration: 25,
            order: 8
          }
        ],
        totalHours: 280
      }
    }
  },

  // Technology Roadmaps
  technology: {
    'MERN Stack': {
      description: 'Full-stack web development with MongoDB, Express, React, Node.js',
      weightage: 100,
      units: [
        {
          title: 'HTML & CSS Fundamentals',
          description: 'Web markup and styling basics',
          topics: [
            'HTML5 Structure',
            'CSS3 Styling',
            'Responsive Design',
            'CSS Flexbox and Grid',
            'CSS Animations'
          ],
          estimatedDuration: 20,
          order: 1
        },
        {
          title: 'JavaScript Fundamentals',
          description: 'Core JavaScript programming concepts',
          topics: [
            'Variables and Data Types',
            'Functions and Scope',
            'Arrays and Objects',
            'DOM Manipulation',
            'ES6+ Features',
            'Async Programming',
            'Error Handling'
          ],
          estimatedDuration: 30,
          order: 2
        },
        {
          title: 'React.js',
          description: 'Frontend library for building user interfaces',
          topics: [
            'React Components',
            'Props and State',
            'Lifecycle Methods',
            'Hooks (useState, useEffect)',
            'Event Handling',
            'Conditional Rendering',
            'Lists and Keys',
            'Forms and Controlled Components',
            'React Router',
            'Context API',
            'Custom Hooks'
          ],
          estimatedDuration: 40,
          order: 3
        },
        {
          title: 'Node.js & Express.js',
          description: 'Backend JavaScript runtime and web framework',
          topics: [
            'Node.js Basics',
            'Express.js Framework',
            'Routing and Middleware',
            'Request/Response Handling',
            'Error Handling',
            'Authentication & Authorization',
            'File Upload',
            'API Development',
            'Testing with Jest'
          ],
          estimatedDuration: 35,
          order: 4
        },
        {
          title: 'MongoDB',
          description: 'NoSQL database for modern applications',
          topics: [
            'MongoDB Basics',
            'CRUD Operations',
            'Data Modeling',
            'Indexing',
            'Aggregation Pipeline',
            'MongoDB Atlas',
            'Mongoose ODM'
          ],
          estimatedDuration: 25,
          order: 5
        },
        {
          title: 'Full-Stack Integration',
          description: 'Connecting frontend and backend',
          topics: [
            'API Integration',
            'State Management',
            'Authentication Flow',
            'Error Handling',
            'Deployment',
            'Performance Optimization',
            'Security Best Practices'
          ],
          estimatedDuration: 30,
          order: 6
        }
      ],
      totalHours: 180
    },
    'AI/ML': {
      description: 'Artificial Intelligence and Machine Learning fundamentals',
      weightage: 100,
      units: [
        {
          title: 'Python for AI/ML',
          description: 'Python programming for data science',
          topics: [
            'Python Basics',
            'NumPy',
            'Pandas',
            'Matplotlib',
            'Seaborn',
            'Jupyter Notebooks'
          ],
          estimatedDuration: 25,
          order: 1
        },
        {
          title: 'Mathematics for ML',
          description: 'Mathematical foundations for machine learning',
          topics: [
            'Linear Algebra',
            'Calculus',
            'Statistics',
            'Probability',
            'Optimization'
          ],
          estimatedDuration: 30,
          order: 2
        },
        {
          title: 'Supervised Learning',
          description: 'Classification and regression algorithms',
          topics: [
            'Linear Regression',
            'Logistic Regression',
            'Decision Trees',
            'Random Forest',
            'Support Vector Machines',
            'Naive Bayes',
            'K-Nearest Neighbors'
          ],
          estimatedDuration: 35,
          order: 3
        },
        {
          title: 'Unsupervised Learning',
          description: 'Clustering and dimensionality reduction',
          topics: [
            'K-Means Clustering',
            'Hierarchical Clustering',
            'Principal Component Analysis',
            'DBSCAN',
            'Association Rules'
          ],
          estimatedDuration: 25,
          order: 4
        },
        {
          title: 'Deep Learning',
          description: 'Neural networks and deep learning',
          topics: [
            'Neural Networks Basics',
            'Backpropagation',
            'Convolutional Neural Networks',
            'Recurrent Neural Networks',
            'TensorFlow/Keras',
            'PyTorch'
          ],
          estimatedDuration: 40,
          order: 5
        },
        {
          title: 'Model Evaluation & Deployment',
          description: 'Model validation and production deployment',
          topics: [
            'Cross-Validation',
            'Hyperparameter Tuning',
            'Model Evaluation Metrics',
            'Feature Engineering',
            'Model Deployment',
            'MLOps Basics'
          ],
          estimatedDuration: 25,
          order: 6
        }
      ],
      totalHours: 180
    }
  }
};

module.exports = syllabusDatasets;
