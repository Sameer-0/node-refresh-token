module.exports = class AcademicCalender {
    constructor(date_str, date, day, day_name, week, iso_week, date_of_week, month, month_name, quater, year, day_of_year) {
        this.date_str = date_str;
        this.date = date;
        this.day = day;
        this.day_name = day_name;
        this.week = week;
        this.iso_week = iso_week;
        this.date_of_week = date_of_week;
        this.month = month;
        this.month_name = month_name;
        this.quater = quater;
        this.year = year;
        this.day_of_year = day_of_year;
    }
}