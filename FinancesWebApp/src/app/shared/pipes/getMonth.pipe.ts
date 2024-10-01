import { inject, Pipe, PipeTransform } from "@angular/core";
import { TranslocoService } from "@ngneat/transloco";

@Pipe({
    name: 'getMonth',
    standalone: true,
})
export class GetMonthPipe implements PipeTransform {
    private readonly translocoService = inject(TranslocoService);
    
    public transform(monthNumeric: number): string {
        const activeLang = this.translocoService.getActiveLang() as 'en' | 'de';
        const monthsAlphabetic = {
            en: ["January", "February", "March", "April","May", "June", "July", "August", "September", "October", "November", "December"],
            de: ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"]
        };

        return monthsAlphabetic[activeLang][monthNumeric - 1];
    }
}