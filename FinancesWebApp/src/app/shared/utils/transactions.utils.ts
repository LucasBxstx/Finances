export function getListOfAvailableYears(oldestDate: Date | null): number[] {
    const currentYear = new Date().getFullYear();

      if (!oldestDate) return [currentYear];

      oldestDate = new Date(oldestDate);
      const oldestYear = oldestDate.getFullYear();
      const allYears: number[] = [];

      for(let year = currentYear; year >= oldestYear ; year--) allYears.push(year);
      
      return allYears;
}

export function getListOfAvailableMonthsPerYear(selectedYear: number, oldestDate: Date | null): number[] {
    if(! oldestDate) return [1,2,3,4,5,6,7,8,9,10,11,12];

      const oldestYear = new Date(oldestDate).getFullYear();
      const oldestMonth = new Date(oldestDate).getMonth() + 1;
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;

      const startMonth = selectedYear == oldestYear ? oldestMonth : 1;
      const endMonth = selectedYear == currentYear ? currentMonth : 12;
      const allMonths: number[] = [];

      for(let month = endMonth; month >= startMonth; month --) allMonths.push(month);
      
      return allMonths;
}