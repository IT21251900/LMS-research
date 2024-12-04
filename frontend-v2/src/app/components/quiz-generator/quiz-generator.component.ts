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
  difficultyLevel: number = 50;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {}

  generateSAQuiz(): void {
    this.isLoading = true;
    this.errorMessage = null;
  
    // POST request to create a short-answer quiz
    this.http
      .post<{
        message: string;
        quiz: { id: string; title: string; questions: Array<{ question: string; correctAnswer: string }> };
      }>('http://localhost:8001/quizzes/short-answers/create', {
        difficultyLevel: this.difficultyLevel,
      })
      .subscribe({
        next: (response) => {
          console.log('Response from POST request:', response);  // Log the full response
  
          const fetchedQuiz = response.quiz;
          console.log('Fetched quiz data:', fetchedQuiz);  // Log the fetched quiz
  
          if (fetchedQuiz && fetchedQuiz.questions?.length > 0) {
            // Handle the fetched quiz properly
            this.quiz = {
              id: fetchedQuiz.id, 
              title: fetchedQuiz.title, 
              questions: fetchedQuiz.questions.map((q) => ({
                question: q.question,
                correctAnswer: q.correctAnswer,
                otherAnswers: [], 
                selectedAnswer: '', 
                isCorrect: undefined, 
                showCorrectAnswer: false, 
              })),
            };
            console.log('Processed quiz object:', this.quiz); 
  
            this.isSubmitted = false;
            this.isLoading = false;
          } else {
            this.errorMessage = 'No questions found in the quiz.';
            this.isLoading = false;
          }
        },
        error: (err) => {
          this.errorMessage = 'Failed to generate short-answer quiz.';
          console.error('Error generating short-answer quiz:', err);  
          this.isLoading = false;
        },
      });
  }  

  fetchSAQuiz(quizId: string): void {
    console.log('Fetching quiz with ID:', quizId);  // Log the quiz ID you're trying to fetch
    
    this.http
      .get<{ quiz: Quiz }>(`http://localhost:8001/quizzes/short-answers/${quizId}`)
      .subscribe({
        next: (response) => {
          console.log('Response from GET request:', response);  // Log the full response
          const quiz = response.quiz;
          console.log('Fetched quiz data:', quiz);  // Log the fetched quiz data
          
          if (quiz && quiz.questions && quiz.questions.length > 0) {
            this.quiz = quiz;
            console.log('Quiz object after fetching:', this.quiz);  // Log the quiz object after fetching
            this.isSubmitted = false;
            this.isLoading = false;
          } else {
            this.errorMessage = 'No questions found in the quiz.';
            this.isLoading = false;
          }
        },
        error: (err) => {
          this.errorMessage = 'Failed to fetch short-answer quiz.';
          console.error('Error fetching short-answer quiz:', err);  
          this.isLoading = false;
        },
      });
  }  

  generateMCQQuiz(): void {
    this.isLoading = true;
    this.errorMessage = null;
  
    // POST request to generate quiz (send userID, difficultyLevel, etc.)
    this.http
      .post<{ quiz: { id: string } }>('http://localhost:8001/quizzes/mcq/generate', {
        difficultyLevel: this.difficultyLevel
      })
      .subscribe({
        next: (response) => {
          const quizId = response.quiz.id;
          console.log('Quiz generated with ID:', quizId);
          if (quizId) {
            // Once quiz is generated, fetch it using GET request
            this.fetchQuiz(quizId);
          } else {
            this.errorMessage = 'Failed to generate quiz.';
            this.isLoading = false;
          }
        },
        error: (err) => {
          this.errorMessage = 'Failed to generate quiz.';
          console.error(err);
          this.isLoading = false;
        }
      });
  }

  fetchQuiz(quizId: string): void {
    this.http.get<{ quiz: Quiz }>(`http://localhost:8001/quizzes/mcq/${quizId}`).subscribe({
      next: (response) => {
        const quiz = response.quiz;
        if (quiz && quiz.questions && quiz.questions.length > 0) {
          // Shuffle answers for MCQ
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
        this.errorMessage = 'Failed to fetch quiz.';
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
