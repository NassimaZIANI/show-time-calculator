import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin, Observable } from 'rxjs';
import { distinct, expand, map, reduce, tap } from 'rxjs/operators';
import { Show } from '../interfaces/show';

@Injectable({
  providedIn: 'root',
})
export class ShowService {
  private rootUrl: string = 'https://api.tvmaze.com';
  public shows$: BehaviorSubject<Show[]> = new BehaviorSubject<Show[] | []>([]);

  public selectedShow$: BehaviorSubject<Show> = new BehaviorSubject<Show>(
    this.shows$.value[0]
  );

  constructor(private http: HttpClient) {}

  public getShows() {
    let i: number = 0;
    let showsList: Show[] = [];

    return this.http.get<Show[] | []>(this.rootUrl + '/shows?page=' + i).pipe(
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
        console.log(i);
        return this.http
          .get<Show[] | []>(this.rootUrl + '/shows?page=' + i)
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

    /*  do {
      console.log(i);
      observableList.push(
        this.http.get<Show[] | []>(this.rootUrl + '/shows?page=' + i).pipe(
          map((data: any) => {
            console.log(i);

            returnedValue = data;
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
          tap((shows: Show[]) => {
            this.shows$.next(shows);
          })
        )
      );
      console.log(observableList);

      i++;
    } while (i === 2);

    return forkJoin(observableList); */
    /* return this.http.get<Show[] | []>(this.rootUrl + '/shows?').pipe(
      map((data: any) => {
        console.log(data);

        // returnedValue = data;
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
      tap((shows: Show[]) => {
        this.shows$.next(shows);
      })
    ); */
  }
}
