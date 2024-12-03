import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

interface Quiz {
  _id: string; 
  title: string;
}

@Component({
  selector: 'app-all-quizzes',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './all-quizzes.component.html',
  styleUrls: ['./all-quizzes.component.scss']
})
export class AllQuizzesComponent implements OnInit {
  quizzes: Quiz[] = [];
  errorMessage: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchAllQuizzes();
  }

  fetchAllQuizzes(): void {
    this.http.get<{ quizzes: Quiz[] }>('http://localhost:8001/api/quiz')
      .subscribe({
        next: (response) => {
          this.quizzes = response.quizzes;
        },
        error: (err) => {
          this.errorMessage = 'Failed to load quizzes. Please try again later.';
          console.error('Error fetching quizzes:', err);
        }
      });
  }
}
