const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 1000, default: '' },
    category: { type: String, required: true, trim: true, lowercase: true, maxlength: 60 },
    tags: { type: [String], default: [], validate: { validator: (tags) => tags.length <= 12, message: 'A product can have a maximum of 12 tags.' } },
    price: { type: Number, required: true, min: 0 },
    images: {
      type: [String],
      validate: {
        validator: (images) => images.length <= 10,
        message: 'A product can have a maximum of 10 images.'
      }
    },
    isVisible: { type: Boolean, default: true },
    stockStatus: { type: String, enum: ['in_stock', 'out_of_stock'], default: 'in_stock' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
