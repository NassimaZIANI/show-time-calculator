import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  public showForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.createForm();
  }

  private createForm() {
    this.showForm = this.fb.group({
      showName: ['', Validators.required],
      seasonsNbr: [''],
      episodesNbr: [''],
      durationHour: [''],
      durationMin: [''],
      watchTimeHour: [''],
      watchTimeMin: [''],
    });
  }

  public calculateTime() {}
}
