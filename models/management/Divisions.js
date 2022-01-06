module.exports = class Divisions {
    constructor(course_id, division, division_num, division_count, status1, count_for_theory_batch, count_for_practical_batch, count_for_tutorial_batch, count_for_workshop_batch) {
        this.course_id = course_id;
        this.division_num = division_num;
        this.division_count = division_count;
        this.status1 = status1;
        this.count_for_practical_batch = count_for_practical_batch;
        this.count_for_theory_batch = count_for_theory_batch;
        this.division = division;
        this.count_for_tutorial_batch = count_for_tutorial_batch;
        this.count_for_workshop_batch = count_for_workshop_batch;
    }
}