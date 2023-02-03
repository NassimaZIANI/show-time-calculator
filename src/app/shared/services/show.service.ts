import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Show } from '../interfaces/show';

@Injectable({
  providedIn: 'root',
})
export class ShowService {
  public shows$: BehaviorSubject<Show[]> = new BehaviorSubject([
    {
      name: 'One Piece',
      seasonsNbr: 1,
      episodesNbr: 1049,
      duration: 23,
    },
    {
      name: 'Spy x Family',
      seasonsNbr: 2,
      episodesNbr: 25,
      duration: 23,
    },
    {
      name: 'Hunter X Hunter',
      seasonsNbr: 1,
      episodesNbr: 62,
      duration: 23,
    },
    {
      name: 'Happiness',
      seasonsNbr: 1,
      episodesNbr: 12,
      duration: 70,
    },
  ]);

  public selectedShow$: BehaviorSubject<Show> = new BehaviorSubject<Show>(
    this.shows$.value[0]
  );

  constructor() {}
}
