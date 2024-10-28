import { Pipe, PipeTransform } from "@angular/core";


@Pipe({
    name: 'getDateDMY',
    standalone: true,
})
export class GetDateDMYPipe implements PipeTransform {
    public transform(date: Date): string {
        const year = new Date(date).getFullYear()
        const weekday = new Date(date).getDay();
        const month = new Date(date).getMonth() + 1;
        const monthString = month < 10 ? '0' + month : month.toString();
        const day = new Date(date).getDate();
        const dayString = day < 10 ? '0' + day : day.toString();

        return `${year}/${monthString}/${dayString}`
    }
}