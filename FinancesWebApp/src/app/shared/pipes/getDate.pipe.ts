import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name: 'getDate',
    standalone: true,
})
export class GetDatePipe implements PipeTransform {
    public transform(date: Date): string {
        const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
        const weekdayIndex = new Date(date).getDay();
        const weekday = weekdays[weekdayIndex];
        const month = new Date(date).getMonth() + 1;
        const day = new Date(date).getDate();

        return `${weekday}, ${day}.${month}.`
    }
}