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
  public result = [0, 0, 0, 0];
  public resultNbrEpPerDay: number = 0;
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
      .valueChanges.subscribe((watchingByEp) => {
        this.showForm.get('watchTime')!.setValue('00:00');
        this.showForm.get('watchEp')!.setValue('');
        this.watchingByEp = watchingByEp;
      });
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

  public calculateTime() {
    // get the show Name
    let showName = this.showForm.value.showName;
    // check if the name came from the API (get showName.name), if it isn't in the API get it by showName only
    showName.name
      ? (this.showName = showName.name)
      : (this.showName = showName);
    // calculate the average time of an episode by minute
    let averageEpInMin = this.toMinutes(this.showForm.value.duration);
    // calculate the average time for all the show in minutes
    let totalTimeInMinute = this.showForm.value.episodesTotal * averageEpInMin;
    let timeByDay = 0;
    this.showForm.value.watchingByEp
      ? // if we get the ep per day, we need to calculate the average time to finish those episodes per day
        (timeByDay = this.showForm.value.watchEp * averageEpInMin)
      : (timeByDay = this.toMinutes(this.showForm.value.watchTime));
    // calculate the time it takes to finish the show
    this.result = this.getTimeNeeded(timeByDay, totalTimeInMinute);
  }

  getTimeNeeded(timeByDay: number, totalTime: number) {
    // timeByDay is in minutes so no need to *60
    let day: number = timeByDay ? timeByDay : 24 * 60;
    var units: any = {
      month: day * 30,
      day: day,
      hour: 60,
      minute: 1,
    };

    var result = [];

    for (var name in units) {
      var p = Math.floor(totalTime / units[name]);
      result.push(p);
      totalTime %= units[name];
    }

    return result;
  }

  private toMinutes(duration?: string) {
    var a = duration!.split(':'); // split it at the colons
    // Hours are worth 60 minutes.
    var minutes = +a[0] * 60 + +a[1];
    return minutes;
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

  get episodesNbr() {
    return this.showForm.controls['episodesNbr'] as FormArray;
  }

  clearFormArray = (formArray: FormArray) => {
    while (formArray.length !== 0) {
      formArray.removeAt(0);
    }
  };
}
