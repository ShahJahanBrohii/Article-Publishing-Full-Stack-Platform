const mongoose = require('mongoose');

// Single-document collection — only one home content record ever exists
const homeContentSchema = new mongoose.Schema(
  {
    hero: {
      category:    { type: String, default: 'Investing' },
      headline:    { type: String, default: 'From Knowledge to Financial Freedom' },
      subheadline: { type: String, default: '' },
      body:        { type: String, default: '' },
      image:       { type: String, default: '' },
      caption:     { type: String, default: '' },
      author:      { type: String, default: 'Junaid Ahmed' },
      date:        { type: String, default: '' },
      readTime:    { type: String, default: '6 min read' },
      ctaLink:     { type: String, default: '#featured' },
    },

    sidebarNews: [
      {
        category: String,
        headline: String,
        time:     String,
        to:       String,
      },
    ],

    opinionPieces: [
      {
        headline: String,
        excerpt:  String,
        author:   String,
        bio:      String,
        to:       String,
      },
    ],

    mostRead: [
      {
        headline:  String,
        views:     String,
        articleId: Number,
        to:        String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('HomeContent', homeContentSchema);
