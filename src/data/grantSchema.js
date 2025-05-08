export const grantSchema = {
  id: String,
  title: String,
  description: String,
  organization: String,
  deadline: Date,
  amount: {
    min: Number,
    max: Number,
    currency: String
  },
  requirements: {
    eligibility: [String],
    documents: [String],
    restrictions: [String]
  },
  application: {
    questions: [{
      id: String,
      type: String, // 'short_answer', 'long_answer', 'document', 'proposal'
      question: String,
      maxLength: Number,
      required: Boolean,
      guidelines: String
    }],
    documents: [{
      type: String,
      description: String,
      required: Boolean,
      format: String
    }]
  },
  metadata: {
    categories: [String],
    tags: [String],
    lastUpdated: Date
  }
}; 