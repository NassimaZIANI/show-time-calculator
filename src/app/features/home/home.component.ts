import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Show } from 'src/app/shared/interfaces/show';
import { ShowService } from 'src/app/shared/services/show.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  public showForm!: FormGroup;
  public shows!: Show[];
  public show!: Show;
  public subscription: Subscription = new Subscription();
  public isShowForm: boolean = false;
  public Arr = Array; //Array type captured in a variable
  public seasonNbr: number = 1;
  public watchingByEp: boolean = false;

  constructor(private fb: FormBuilder, private showService: ShowService) {}

  ngOnInit(): void {
    this.subscription.add(
      this.showService.shows$.subscribe((shows: Show[]) => {
        this.shows = shows;
      })
    );

    this.subscription.add(
      this.showService.selectedShow$.subscribe((show: Show) => {
        this.show = show;
      })
    );
    this.createForm();
    this.showForm
      .get('isShowForm')!
      .valueChanges.subscribe((isShowForm) => (this.isShowForm = isShowForm));
    this.showForm
      .get('seasonsNbr')!
      .valueChanges.subscribe((seasonsNbr) => (this.seasonNbr = seasonsNbr));
    this.showForm
      .get('watchingByEp')!
      .valueChanges.subscribe(
        (watchingByEp) => (this.watchingByEp = watchingByEp)
      );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private createForm() {
    this.showForm = this.fb.group({
      showName: ['', Validators.required],
      isShowForm: [false],
      seasonsNbr: [''],
      episodesNbr: [''],
      durationHour: [''],
      durationMin: [''],
      watchingByEp: [''],
      watchEp: [''],
      watchTimeHour: [''],
      watchTimeMin: [''],
    });
  }

  public calculateTime() {}
}
