import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name: 'getMonth',
    standalone: true,
})
export class GetMonthPipe implements PipeTransform {
    public transform(monthNumeric: number): string {
        const monthsAlphabetic = ["January", "February", "March", "April","May", "June", "July", "August", "September", "October", "November", "December"];
        return monthsAlphabetic[monthNumeric - 1];
    }
}