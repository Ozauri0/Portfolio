const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  // Basic info
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  order: {
    type: Number,
    default: 0
  },
  visible: {
    type: Boolean,
    default: true
  },
  
  // Titles (multilingual)
  title: {
    en: {
      type: String,
      required: true,
      trim: true
    },
    es: {
      type: String,
      required: true,
      trim: true
    }
  },
  
  // Descriptions (multilingual)
  description: {
    en: {
      type: String,
      required: true
    },
    es: {
      type: String,
      required: true
    }
  },
  
  // Image
  image: {
    type: String,
    required: true
  },
  
  // Links (all optional)
  links: {
    github: {
      type: String,
      default: null
    },
    demo: {
      type: String,
      default: null
    },
    download: {
      type: String,
      default: null
    }
  },
  
  // Demo button type
  demoType: {
    type: String,
    enum: ['demo', 'download', 'documentation', null],
    default: null
  },
  
  // Technologies used (array of tech keys)
  technologies: [{
    type: String,
    trim: true
  }],
  
  // Hover border color
  hoverColor: {
    type: String,
    enum: ['blue', 'green', 'purple', 'red', 'orange', 'yellow', 'pink', 'cyan', 'indigo'],
    default: 'blue'
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
projectSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for ordering
projectSchema.index({ order: 1, createdAt: -1 });

module.exports = mongoose.model('Project', projectSchema);
