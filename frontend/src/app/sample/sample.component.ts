import { Component, OnInit } from '@angular/core';
import { DataService } from '../service/data.service';

@Component({
  selector: 'app-sample',
  templateUrl: './sample.component.html',
  styleUrl: './sample.component.scss'
})
export class SampleComponent implements OnInit{
  faculties:any;

  constructor(private dataService:DataService) {}

  ngOnInit(): void {
    this.getFacultyData();
  }

  getFacultyData(){
    this.dataService.getData().subscribe(res => {
      this.faculties = res;
      console.log(res);
    });
  }
  
}
