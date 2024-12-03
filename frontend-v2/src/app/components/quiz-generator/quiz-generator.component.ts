import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Question {
  question: string;
  correctAnswer: string;
  otherAnswers: string[];
  allAnswers?: string[];
  selectedAnswer?: string;
  isCorrect?: boolean;
  showCorrectAnswer?: boolean;
}

interface Quiz {
  id: string;
  title: string;
  questions: Question[];
}

@Component({
  selector: 'app-quiz-generator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './quiz-generator.component.html',
  styleUrls: ['./quiz-generator.component.scss']
})
export class QuizGeneratorComponent implements OnInit {
  quiz: Quiz | null = null;
  errorMessage: string | null = null;
  isSubmitted = false;
  isLoading = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {}

  generateSAQuiz(): void {
    this.isLoading = true;
    this.errorMessage = null;
  
    this.http
      .get<{
        quiz: {
          title: string;
          question: string[];
          correctAnswer: string[];
          // _additional: { id: string };
        };
      }>('http://localhost:8001/quizzes/short-answers/bf02e446-b5e8-4dff-b52e-90ff11a15c2a')
      .subscribe({
        next: (response) => {
          const fetchedQuiz = response.quiz;
          console.log(fetchedQuiz);
  
          if (
            fetchedQuiz &&
            fetchedQuiz.question.length > 0 &&
            fetchedQuiz.correctAnswer.length > 0 
            // && fetchedQuiz._additional?.id
          ) {
            this.quiz = {
              id: "bf02e446-b5e8-4dff-b52e-90ff11a15c2a" , 
              title: fetchedQuiz.title,
              questions: fetchedQuiz.question.map((q, index) => ({
                question: q,
                correctAnswer: fetchedQuiz.correctAnswer[index],
                otherAnswers: [],
                allAnswers: undefined,
                selectedAnswer: '',
                isCorrect: undefined,
                showCorrectAnswer: false,
              })),
            };
            this.isSubmitted = false;
            this.isLoading = false;
          } else {
            this.errorMessage = 'No questions found in the quiz.';
            this.isLoading = false;
          }
        },
        error: (err) => {
          this.errorMessage = 'Failed to generate short answer quiz.';
          console.error(err);
          this.isLoading = false;
        },
      });
  }  

  generateMCQQuiz(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.http.get<{ quiz: Quiz }>('http://localhost:8001/quizzes/mcq/674d30c3b2af998534564318')
      .subscribe({
        next: (response) => {
          const quiz = response.quiz;

          if (quiz && quiz.questions && quiz.questions.length > 0) {
            quiz.questions.forEach((q: Question) => {
              q.allAnswers = [q.correctAnswer, ...(q.otherAnswers || [])];
              q.allAnswers = q.allAnswers.sort(() => Math.random() - 0.5); // Shuffle answers
            });
            this.quiz = quiz;
            this.isSubmitted = false;
            this.isLoading = false;
          } else {
            this.errorMessage = 'No questions found in the quiz.';
            this.isLoading = false;
          }
        },
        error: (err) => {
          this.errorMessage = 'Failed to generate multiple-choice quiz.';
          console.error(err);
          this.isLoading = false;
        }
      });
  }

  submitMCQQuiz(): void {
    if (!this.quiz) return;

    this.quiz.questions.forEach((question) => {
      question.isCorrect = question.selectedAnswer === question.correctAnswer;
    });

    this.isSubmitted = true;
  }

  submitSAQuiz(): void {
    if (!this.quiz) return;
  
    const answers = this.quiz.questions.map((q) => ({
      question: q.question,
      answer: q.selectedAnswer || '',
    }));

    // Check if all answers are empty
    const emptyAnswers = answers.filter((a) => a.answer.trim() === '').length;

    if (emptyAnswers === answers.length) {
      this.errorMessage = 'Please provide answers to all questions before submitting.';
      return;
    }

    console.log('Request Payload:', {
      quizId: this.quiz.id, 
      answers: answers,      
    });
  
    this.http.post<{ results: any[] }>('http://localhost:8001/quizzes/short-answers/validate', {
      quizId: this.quiz.id, 
      answers,
    }).subscribe({
      next: (response) => {
        response.results.forEach((result, index) => {
          const question = this.quiz?.questions[index];
          if (question) {
            question.isCorrect = result.isCorrect;
            question.showCorrectAnswer = true;
            question.correctAnswer = result.feedback.includes(': ')
              ? result.feedback.split(': ')[1] 
              : question.correctAnswer; 
          }
        });
  
        this.isSubmitted = true;
      },
      error: (err) => {
        this.errorMessage = 'Failed to validate short-answer quiz answers.';
        console.error(err);
      },
    });
  }

  resetQuiz(): void {
    if (!this.quiz) return;

    this.quiz.questions.forEach((question) => {
      question.selectedAnswer = undefined;
      question.isCorrect = undefined;
      question.showCorrectAnswer = false; 
    });

    this.isSubmitted = false;
  }

  getCorrectAnswersCount(): number {
    return this.quiz ? this.quiz.questions.filter((q) => q.isCorrect).length : 0;
  }
}
