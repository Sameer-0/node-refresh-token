const Settings = require("../../models/Settings");
const DboDays = require("../../models/DboDays");
const Holidays = require("../../models/Holidays");
const Rooms = require('../../models/Rooms');
const Buildings = require('../../models/Buildings');
const Organizations = require('../../models/Organizations');
const Divisions = require('../../models/Divisions');
const SlotIntervalTimings = require('../../models/SlotIntervalTimings');
const Campuses = require('../../models/Campuses');
const AcademicCalender = require("../../models/AcademicCalender");
const Programs = require('../../models/Programs');
const ProgramTypes = require('../../models/programType');
const AcadYear = require('../../models/AcademicYear');
const AcadSession = require('../../models/AcadSession');
const SessionTypes = require('../../models/SessionTypes'); 
const CourseWorkload = require('../../models/CourseWorkload');
const Faculties = require('../../models/Faculties');
const FacultyDbo = require('../../models/FacultyDbo');
const DivisionBatches = require('../../models/DivisionBatches');
const SchoolTimingType = require('../../models/SchoolTimingType');
const HolidayTypes = require('../../models/HolidayTypes');
const ModuleType =  require('../../models/ModuleType');
const FacultyTypes = require("../../models/FacultyTypes");
const FacultyWorkTimePreferences = require('../../models/FacultyWorkTimePreferences');
const ProgramDays = require('../../models/ProgramDays');
const ProgramSessions = require('../../models/ProgramSessions');
const RoomTransactionTypes = require('../../models/RoomTransactionTypes');
const RoomTransactions = require('../../models/RoomTransactions');
const ProgramsDbo = require('../../models/ProgramsDbo'); 
const SessionDates = require('../../models/SessionDates');
const FacultyWorks = require('../../models/FacultyWorks');
const SchoolTimingSettings = require('../../models/SchoolTimingSettings');
const FacultyDateTimes = require('../../models/FacultyDateTimes');



module.exports = {
    getDashboard: (req, res) => {
        Promise.all([Settings.fetchStepForm(res.locals.slug), DboDays.fetchAll(10), Rooms.fetchAll(100), Divisions.fetchAll(100, res.locals.slug), Organizations.fetchAll(200), Buildings.fetchAll(50), SlotIntervalTimings.fetchAll(100), Campuses.fetchAll(500), AcademicCalender.fetchAll(100), Programs.fetchAll(10, res.locals.slug), ProgramTypes.fetchAll(100, res.locals.slug), AcadYear.fetchAll(), AcadSession.fetchAll(1000), SessionTypes.fetchAll(10, res.locals.slug), AcademicCalender.fetchAll(100), CourseWorkload.getAll(res.locals.slug), Divisions.fetchAll(100, res.locals.slug), Faculties.fetchAll(100, res.locals.slug), FacultyDbo.fetchAll(1000), SlotIntervalTimings.fetchAll(100), DivisionBatches.fetchAll(100, res.locals.slug), SchoolTimingType.fetchAll(10), HolidayTypes.fetchAll(100), ModuleType.fetchAll(1000, res.locals.slug), FacultyTypes.fetchAll(100), FacultyWorkTimePreferences.fetchAll(10, res.locals.slug), ProgramDays.fetchAll(1000, res.locals.slug), ProgramSessions.fetchAll(100, res.locals.slug), RoomTransactionTypes.fetchAll(100), Rooms.bookedRooms(res.locals.slug), ProgramsDbo.fetchAll(1000), SessionDates.fetchAll(10, res.locals.slug), FacultyWorks.fetchAll(10, res.locals.slug), SchoolTimingSettings.fetchAll(100, res.locals.slug), SchoolTimingSettings.checkStatus(res.locals.slug), FacultyDateTimes.fetchAll(10, res.locals.slug), Organizations.getChildByParentId(res.locals.organizationId), DivisionBatches.fetchDistinctBatches(res.locals.slug)]).then(result => {
            res.render('admin/dashboard/index', {
                currentFormStep: result[0].recordset[0] ? result[0].recordset[0].seq : '',
                dayList: result[1].recordset,
                RoomList: result[2].recordset,
                divisionList: result[3].recordset, 
                orgList: result[4].recordset,  
                buildingList: result[5].recordset,
                slotTiming:JSON.stringify(result[6].recordset),
                campusList: result[7].recordset,
                acadCalender: JSON.stringify(result[8].recordset),
                programList: result[9].recordset,
                programTypeList: JSON.stringify(result[10].recordset),
                acadYear: result[11].recordset[0].input_acad_year, 
                AcadSessionList: result[12].recordset,
                sessionList: result[13].recordset, 
                acadCal: result[14].recordset,
                courseWorkloadList: result[15].recordset,
                divisionData: result[16].recordset, 
                facultyList: result[17].recordset,
                faculties: result[18].recordset, 
                slotTime: result[19].recordset,
                divisionBatchList: result[20].recordset,
                schoolTimingTypeList: result[21].recordset,
                holidayTypeList: result[22].recordset,              
                moduleList: result[23].recordset,
                facultyType: JSON.stringify(result[24].recordset),
                facultyPreferenceList: result[25].recordset,
                facultyWorkList: result[32].recordset,
                programDayList: result[26].recordset,
                programSession: result[27].recordset,
                transactionTypes:  JSON.stringify(result[28].recordset),
                transactionList: result[29].recordset,
                programDboList: result[30].recordset,
                sessionDateList: result[31].recordset,
                schoolTimingSettingsList: result[33].recordset,
                schoolTimingSettingsListJson: JSON.stringify(result[33].recordset), 
                stsStatus: result[32].recordset.length > 0 ? result[34].recordset[0].status : 0,
                FacultyDateTimeList: result[35].recordset,
                orgParentList: result[36].recordset,
                batchList: result[37].recordset,
                path:'/admin'
            })
        }).catch(error => { 
            console.log('Dash Error+++++++++++',error)
        }) 
    },
 
    dashboardStepForm: (req, res) => {
        console.log('dashboard stepform', result[1].recordset )
        Promise.all([Settings.fetchStepForm(res.locals.slug), Rooms.fetchAll(100)]).then(result => {
            res.render('admin/dashboard/index', {
                currentFormStep: result[0].recordset[0] ? result[0].recordset[0].seq : '',
                RoomList: result[1].recordset,
                path:'/admin'
            })
        })
        
    },



}