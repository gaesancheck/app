export function isValidMonthDay(value: string): boolean {
    if (!/^\d{2}\.\d{2}$/.test(value)) return false;
    const [month, day] = value.split(".").map(Number);
    const daysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    return month >= 1 && month <= 12 && day >= 1 && day <= daysInMonth[month - 1];
}
