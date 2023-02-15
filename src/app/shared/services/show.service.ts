import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin, Observable } from 'rxjs';
import { distinct, expand, filter, map, reduce, tap } from 'rxjs/operators';
import { Show } from '../interfaces/show';

@Injectable({
  providedIn: 'root',
})
export class ShowService {
  private rootUrl: string = 'https://api.tvmaze.com/';
  public shows$: BehaviorSubject<Show[]> = new BehaviorSubject<Show[] | []>([]);

  public selectedShow$: BehaviorSubject<Show | null> =
    new BehaviorSubject<Show | null>(null);

  constructor(private http: HttpClient) {}

  public getShows() {
    let i: number = 0;
    let showsList: Show[] = [];

    return this.http.get<Show[] | []>(this.rootUrl + 'shows?page=' + i).pipe(
      map((data: any) => {
        return data.map((show: any) => {
          return {
            id: show.id,
            name: show.name,
            img: show.image.medium,
            duration: show.averageRuntime,
            url: show._links.self.href,
          };
        });
      }),
      expand((data: any) => {
        i++;
        return this.http
          .get<Show[] | []>(this.rootUrl + 'shows?page=' + i)
          .pipe(
            map((data: any) => {
              return data.map((show: any) => {
                let img = '';
                if (show.image) img = show.image.medium;
                let returnedShow = {
                  id: show.id,
                  name: show.name,
                  img: img,
                  duration: show.averageRuntime,
                  url: show._links.self.href,
                };
                showsList.push(returnedShow);
                return returnedShow;
              });
            })
          );
      }),
      tap((shows: Show[]) => {
        shows.map((shows) => showsList.push(shows));
        this.shows$.next(showsList);
      })
    );
  }

  public getShowDetail(show: Show) {
    return this.http
      .get<Show>(this.rootUrl + 'shows/' + show.id + '/episodes')
      .pipe(
        map((data: any) => {
          let seasonNbr: number = 1;
          data.map((d: any) => {
            seasonNbr = d.season;
          });
          let episodesNbr = [];
          for (let i = 1; i <= seasonNbr; i++)
            episodesNbr[i] = data.filter((el: any) => el.season === i).length;
          return {
            id: show.id,
            name: show.name,
            seasonsNbr: seasonNbr,
            episodesNbr: episodesNbr,
            episodesTotal: data.length,
            duration: show.duration,
            img: show.img,
            url: show.url,
          };
        }),
        tap((show: Show) => {
          this.selectedShow$.next(show);
        })
      );
  }
}
