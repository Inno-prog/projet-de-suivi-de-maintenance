import { Pipe, PipeTransform } from '@angular/core';
import { formatLotDisplay } from '../utils/lot-utils';

@Pipe({
  name: 'lotDisplay',
  standalone: true
})
export class LotDisplayPipe implements PipeTransform {
  transform(value?: string): string {
    return formatLotDisplay(value);
  }
}
