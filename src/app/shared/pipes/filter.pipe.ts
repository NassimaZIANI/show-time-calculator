import { Pipe, PipeTransform } from '@angular/core';
import { Show } from '../interfaces/show';

@Pipe({
  name: 'filter',
})
export class FilterPipe implements PipeTransform {
  transform(shows: Show[], search: string): Show[] | null {
    return shows
      ? shows.filter((show: Show) =>
          show.name.toLowerCase().includes(search.toLowerCase())
        )
      : null;
  }
}
