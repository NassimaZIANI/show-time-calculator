import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormArray,
  AbstractControl,
} from '@angular/forms';
import { merge, Observable, Subscription } from 'rxjs';
import { map, debounceTime, takeUntil, filter, reduce } from 'rxjs/operators';
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
  public show?: Show | null;
  public subscription: Subscription = new Subscription();
  public Arr = Array; //Array type captured in a variable
  public seasonNbr: number = 1;
  public watchingByEp: boolean = false;
  public showName = '';
  public model: any;
  search = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      map((term) => {
        let x;
        if (term === '') return [];
        else {
          x = this.shows
            .filter(
              (v) => v.name.toLowerCase().indexOf(term.toLowerCase()) > -1
            )
            .slice(0, 3);
          return x.length != 0 ? x : [{ name: 'No Result Found' }];
        }
      })
    );

  formatter = (x: { name: string }) => x.name;

  constructor(private fb: FormBuilder, private showService: ShowService) {}

  ngOnInit(): void {
    this.showService.getShows().subscribe();

    this.subscription.add(
      this.showService.shows$.subscribe((shows: Show[]) => {
        this.shows = [...new Set(shows)];
      })
    );

    /* this.subscription.add(
      this.showService.selectedShow$.subscribe((show: Show) => {
        this.show = show;
      })
    ); */
    this.createForm();

    this.showForm.get('showName')!.valueChanges.subscribe((name) => {
      this.showForm.get('duration')!.setValue('00:00');
      //this.showForm.get('episodesNbr')!.setValue('');
      if (this.shows.includes(name)) {
        this.showService.getShowDetail(name).subscribe();
        this.subscription.add(
          this.showService.selectedShow$.subscribe((show: Show | null) => {
            this.showForm.get('seasonsNbr')!.setValue(show?.seasonsNbr);
            this.showForm.get('episodesTotal')!.setValue(show?.episodesTotal);
            if (show) {
              this.clearFormArray(this.episodesNbr);
              show.episodesNbr!.map((ep: number) => {
                console.log(ep);

                const epsForm = this.fb.group({
                  number: ep,
                });

                this.episodesNbr.push(epsForm);
              });
            }
            //this.showForm.get('episodesNbr')!.setValue(show?.episodesNbr);
            if (show) {
              let time = this.toHoursAndMinutes(show.duration);
              this.showForm.get('duration')!.setValue(time);
            }
            this.show = show;
          })
        );
      }
    });

    this.showForm.get('seasonsNbr')!.valueChanges.subscribe((seasonsNbr) => {
      this.seasonNbr = seasonsNbr;
      this.clearFormArray(this.episodesNbr);
      for (let i = 1; i <= seasonsNbr; i++) {
        const epsForm = this.fb.group({
          number: null,
        });

        this.episodesNbr.push(epsForm);
      }
    });

    this.showForm
      .get('episodesNbr')!
      .valueChanges.pipe(
        filter((data) => data.length === this.seasonNbr),
        map((data: any) => data.map((el: any) => el.number)),
        map((data: any) => data.reduce((sum: number, el: number) => sum + el))
      )
      .subscribe((data) => this.showForm.get('episodesTotal')!.setValue(data));

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
      seasonsNbr: [''],
      episodesNbr: this.fb.array([]),
      episodesTotal: [''],
      duration: ['00:00'],
      watchingByEp: [''],
      watchEp: [''],
      watchTime: ['00:00'],
      currentSeason: [1],
      currentEpisode: [1],
    });
  }

  private toHoursAndMinutes(totalMinutes?: number) {
    const hours = Math.floor(totalMinutes! / 60);
    const minutes = totalMinutes! % 60;

    return hours.toString().length === 1
      ? minutes.toString().length === 1
        ? '0' + hours + ':0' + minutes
        : '0' + hours + ':' + minutes
      : minutes.toString().length === 1
      ? hours + ':0' + minutes
      : hours + ':' + minutes;
  }

  public calculateTime() {
    console.log(this.showForm.value);
  }

  get episodesNbr() {
    return this.showForm.controls['episodesNbr'] as FormArray;
  }

  clearFormArray = (formArray: FormArray) => {
    while (formArray.length !== 0) {
      formArray.removeAt(0);
    }
  };
}
