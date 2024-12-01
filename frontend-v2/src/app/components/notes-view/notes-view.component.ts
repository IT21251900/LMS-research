import { Component, OnInit } from '@angular/core';
import Quill from 'quill';

@Component({
  selector: 'app-notes-view',
  standalone: true,
  templateUrl: './notes-view.component.html',
  styleUrls: ['./notes-view.component.scss'] // Use 'styleUrls' (plural) for styles
})
export class NotesViewComponent implements OnInit {
  private quill!: Quill; // Using definite assignment assertion

  constructor() {}

  ngOnInit(): void {
    // Initialize the Quill editor when the component is initialized
    this.quill = new Quill('#editor', {
      theme: 'snow'
    });
  }
}
