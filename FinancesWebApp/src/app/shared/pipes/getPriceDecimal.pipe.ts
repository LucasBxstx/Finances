import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name: 'getPriceDecimal',
    standalone: true,
})
export class GetPriceDecimalPipe implements PipeTransform {
    public transform(price: number): string {
        return price.toFixed(2);
    }
}