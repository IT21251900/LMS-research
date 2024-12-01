import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  correctAnswer: { type: String, required: true },
  otherAnswers: [{ type: String, required: true }],
});

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  contentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'PdfExtraction', 
    required: true
  },
  questions: [questionSchema],
});

const Quiz = mongoose.model('quiz', quizSchema);

export default Quiz;