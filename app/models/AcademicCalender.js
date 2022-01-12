module.exports = class AcademicCalender {
    constructor(dateStr, date, day, dayName, week, isoWeek, dateOfWeek, month, monthName, quater, year, dayOfYear) {
        this.dateStr = dateStr;
        this.date = date;
        this.day = day;
        this.dayName = dayName;
        this.week = week;
        this.isoWeek = isoWeek;
        this.dateOfWeek = dateOfWeek;
        this.month = month;
        this.monthName = monthName;
        this.quater = quater;
        this.year = year;
        this.dayOfYear = dayOfYear;
    }
}