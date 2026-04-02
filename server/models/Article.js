const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema(
  {
    title:     { type: String, required: true, trim: true },
    topic:     { type: String, required: true, trim: true },
    excerpt:   { type: String, required: true, trim: true },
    body:      { type: String, default: '' },
    image:     { type: String, default: '' },
    author:    { type: String, default: 'Editorial Board', trim: true },
    status:    { type: String, enum: ['draft', 'published'], default: 'draft' },
    views:     { type: Number, default: 0 },
    section:   { type: String, default: '' },
    tags:      [{ type: String }],
    publishedAt: { type: Date },
  },
  { timestamps: true }
);

// Auto-set publishedAt when status changes to published
articleSchema.pre('save', function (next) {
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

module.exports = mongoose.model('Article', articleSchema);
