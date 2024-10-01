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
        const year = new Date(date).getFullYear();
        const month = new Date(date).getMonth() + 1;
        const monthString = month < 10 ? '0' + month : month.toString();
        const day = new Date(date).getDate();
        const dayString = day < 10 ? '0' + day : day.toString();

        return `${weekday}, ${dayString}.${monthString}.`
    }
}