import { inject, Pipe, PipeTransform } from "@angular/core";
import { TranslocoService } from "@ngneat/transloco";

@Pipe({
    name: 'getDate',
    standalone: true,
})
export class GetDatePipe implements PipeTransform {
    private readonly translocoService = inject(TranslocoService);

    public transform(date: Date): string {
        const currentLang = this.translocoService.getActiveLang() as 'de' | 'en';

        const weekdays = {
            en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            de: ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"]
        }

        const weekdayIndex = new Date(date).getDay();
        const weekday = weekdays[currentLang][weekdayIndex];
        const month = new Date(date).getMonth() + 1;
        const monthString = month < 10 ? '0' + month : month.toString();
        const day = new Date(date).getDate();
        const dayString = day < 10 ? '0' + day : day.toString();

        return `${weekday}, ${dayString}.${monthString}.`
    }
}