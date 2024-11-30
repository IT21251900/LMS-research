import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
}

interface Quiz {
  title: string;
  questions: Question[];
}

@Component({
  selector: 'app-quiz-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './quiz-detail.component.html',
  styleUrls: ['./quiz-detail.component.scss']
})
export class QuizDetailComponent implements OnInit {
  quiz: Quiz | null = null;
  errorMessage: string = '';
  isSubmitted: boolean = false;

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit(): void {
    const quizId = this.route.snapshot.paramMap.get('id');
    if (quizId) {
      this.fetchQuizById(quizId);
    }
  }

  fetchQuizById(id: string): void {
    this.http.get<{ quiz: Quiz }>(`http://localhost:8001/api/quiz/${id}`)
      .subscribe({
        next: (response) => {
          this.quiz = response.quiz;
          this.quiz.questions.forEach((q) => {
            q.allAnswers = [q.correctAnswer, ...q.otherAnswers].sort(() => Math.random() - 0.5);
          });
        },
        error: (err) => {
          this.errorMessage = 'Failed to load the quiz. Please try again later.';
          console.error('Error fetching quiz:', err);
        }
      });
  }

  submitQuiz(): void {
    if (this.quiz) {
      this.quiz.questions.forEach((q) => {
        q.isCorrect = q.selectedAnswer === q.correctAnswer;
      });
      this.isSubmitted = true;
    }
  }

  // Method to count correct answers
  getCorrectAnswersCount(): number {
    return this.quiz?.questions.filter((q) => q.isCorrect).length || 0;
  }

  // Method to reset the quiz
  resetQuiz(): void {
    if (this.quiz) {
      this.isSubmitted = false;
      this.quiz.questions.forEach((q) => {
        q.selectedAnswer = undefined;
        q.isCorrect = undefined;
      });
    }
  }
}
