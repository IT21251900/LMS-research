import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { CommonModule } from '@angular/common';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NzIconModule, NzButtonModule, NzFormModule, ReactiveFormsModule, FormsModule, NzInputModule,CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

  documents: { title: string; url: string; date: string; readTime: string; content: string[] }[] = [];

  constructor() {
    // Initialize with a sample document if needed
    this.documents.push({
      title: 'The Ultimate Guide to Study Techniques.pdf',
      url: 'courseweb.sliit.lk',
      date: '24th Nov 2024',
      readTime: '3hr Read',
      content: [
        '1. Understanding Your Learning Style',
        '2. Time Management Techniques',
        '3. Active Learning Methods',
        '4. Memory Enhancement Strategies',
        '5. Note-Taking Systems',
        '6. Optimising Your Study Environment'
      ]
    });
  }

  addDocument() {

    const newDocument = {
      title: 'New Document Title.pdf', 
      url: 'newurl.example.com', 
      date: new Date().toLocaleDateString(),
      readTime: '2hr Read',        
      content: [
        '1. New Content Item 1',
        '2. New Content Item 2',
      ]
    };

    this.documents.push(newDocument);
  }
}
