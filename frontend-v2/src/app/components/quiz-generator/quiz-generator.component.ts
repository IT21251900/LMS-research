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
  
    this.http.get<{ quiz: { title: string; question: string[]; correctAnswer: string[] } }>(
      'http://localhost:8001/quizzes/short-answers/9ea24c8d-7467-4851-bff8-86b017b6bbfe'
    ).subscribe({
      next: (response) => {
        const fetchedQuiz = response.quiz;
  
        if (fetchedQuiz && fetchedQuiz.question.length > 0 && fetchedQuiz.correctAnswer.length > 0) {
          this.quiz = {
            title: fetchedQuiz.title,
            questions: fetchedQuiz.question.map((q, index) => ({
              question: q,
              correctAnswer: fetchedQuiz.correctAnswer[index],
              otherAnswers: [],
              allAnswers: undefined,
              selectedAnswer: '',
              isCorrect: undefined,
              showCorrectAnswer: false
            }))
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
      }
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

  submitQuiz(): void {
    if (!this.quiz) return;

    this.quiz.questions.forEach((question) => {
      question.isCorrect = question.selectedAnswer === question.correctAnswer;
      question.showCorrectAnswer = true; // Display the correct answer after submission
    });

    this.isSubmitted = true;
  }

  resetQuiz(): void {
    if (!this.quiz) return;

    this.quiz.questions.forEach((question) => {
      question.selectedAnswer = undefined;
      question.isCorrect = undefined;
      question.showCorrectAnswer = false; // Hide correct answers on reset
    });

    this.isSubmitted = false;
  }

  getCorrectAnswersCount(): number {
    return this.quiz ? this.quiz.questions.filter((q) => q.isCorrect).length : 0;
  }
}
