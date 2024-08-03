import { Component, OnInit } from '@angular/core';
import { MaterialComponents } from '../../../imports/material.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MaterialComponents],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit{
  facultyName: string = 'Unknown Faculty';  // Initialize with a default value

  constructor() { }

  ngOnInit(): void {
    // Update the property
    const storedName = sessionStorage.getItem('faculty_name');
    if (storedName) {
      this.facultyName = storedName;
    }
  }
}
