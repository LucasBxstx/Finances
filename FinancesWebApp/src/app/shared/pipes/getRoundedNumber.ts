import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name: 'getRoundedNumber',
    standalone: true,
})
export class GetRoundedNumber implements PipeTransform {
    public transform(number: number): number {
        return Math.round(number * 100) / 100;
    }
}