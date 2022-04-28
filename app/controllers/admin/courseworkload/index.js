const {
  check,
  oneOf,
  validationResult
} = require('express-validator');
const CourseWorkload = require('../../../models/CourseWorkload')
const AcadYear = require('../../../models/AcademicYear')
const Programs = require('../../../models/Programs')
const AcadSession = require('../../../models/AcadSession')
const ModuleType = require('../../../models/ModuleType')
const Settings = require('../../../models/Settings');


const path = require("path");
var soap = require("soap");
module.exports = {
  getPage: (req, res) => {
    Promise.all([CourseWorkload.getAll(res.locals.slug), CourseWorkload.getCount(res.locals.slug), AcadYear.fetchAll(), Programs.fetchAll(100, res.locals.slug), AcadSession.fetchAll(1000), ModuleType.fetchAll(1000, res.locals.slug)]).then(result => {

      console.log(result[0].recordset)

      res.render('admin/courseworkload/index', {
        courseWorkloadList: result[0].recordset,
        pageCount: result[1].recordset[0].count,
        acadYear: result[2].recordset[0].input_acad_year,
        programList: result[3].recordset,
        AcadSessionList: result[4].recordset,
        moduleList: result[5].recordset
      })
    })
  },

  fetchFromSAP: async (req, res, next) => {
    console.log('REQ::::::::::::::::', req.body)
    let {
      acadYear,
      programLid,
      acadSessionLid
    } = req.body;

    if (!acadSessionLid) {
      acadSessionLid = "";
    }
    if (!programLid) {
      programLid = "";
    }

    var wsdlUrl = path.join(
      process.env.WSDL_PATH,
      "zacad_student_workload_seh.wsdl"
    );

    console.log('wsdlUrl::::::::::::::::', wsdlUrl)


    let soapClient = await new Promise(resolve => {
      soap.createClient(wsdlUrl, async function (err, soapClient) {
        if (err) {
          next(err);
        }
        resolve(soapClient);
      })
    })

    let courseWorkloadList = await new Promise(async resolve => {
      await soapClient.ZACAD_STUDENT_WORKLOAD.ZACAD_STUDENT_WORKLOAD.ZACAD_STUDENT_WORKLOAD({
          YEAR: acadYear,
          CAMPUS_ID: "50070078",
          SCHOOL_ID: "00004533",
          SESSION: acadSessionLid,
          PROGRAM_ID: programLid,
        },
        async function (err, result) {
          let output = await result;
          resolve(output.WORKLOAD_DETAILS ? output.WORKLOAD_DETAILS.item : []);
        });
    })

    console.log('courseWorkloadList:::::::::', JSON.stringify(courseWorkloadList))


    CourseWorkload.fetchCourseWorklaodSap(JSON.stringify(courseWorkloadList), req.session.userId, res.locals.slug).then(data => {

      console.log('Data>>> ', data)
      console.log("acadSessionLif>>> ", acadSessionLid)

      res.status(200).json({
        data: courseWorkloadList
      });
    }).catch(err => {
      console.log(err)
    });
  },

  changestatus: (req, res) => {
    CourseWorkload.changeStatus(req.body, res.locals.slug).then(result => {
      res.json({
        status: "200",
        message: "Success",
      })
    }).catch(error => {
      throw error
    })
  },

  getAll: (req, res) => {
    CourseWorkload.fetchAll(10, res.locals.slug).then(result => {
      res.status(200).json({
        status: 200,
        result: result.recordset
      })
    })
  },

  search: (req, res) => {
    let rowcount = 10;
    CourseWorkload.search(rowcount, req.query.keyword, res.locals.slug).then(result => {
      if (result.recordset.length > 0) {
        res.json({
          status: "200",
          message: "Room Type fetched",
          data: result.recordset,
          length: result.recordset.length
        })
      } else {
        res.json({
          status: "400",
          message: "No data found",
          data: result.recordset,
          length: result.recordset.length
        })
      }
    }).catch(error => {
      res.status(500).json(error.originalError.info.message)
    })
  },

  pagination: (req, res, ) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(422).json({
        statuscode: 422,
        errors: errors.array()
      });
      return;
    }

    CourseWorkload.pagination(req.body.pageNo, res.locals.slug).then(result => {
      res.json({
        status: "200",
        message: "Quotes fetched",
        data: result.recordset,
        length: result.recordset.length
      })
    }).catch(error => {
      throw error
    })
  },

  update: (req, res) => {
    let object = {
      update_initial_course_workload: JSON.parse(req.body.inputJSON)
    }

    console.log('userid', res.locals.userId, req.body.settingName)
    CourseWorkload.update(object, res.locals.slug, res.locals.userId).then(result => {
     // console.log('result:::::::::::>>>', result)

      //IF ROOM APPLILICED ACCESSFULLY THEN NEED TO UPDATE SETTING TABLE DATA
      if (req.body.settingName) {
        Settings.updateByName(res.locals.slug, req.body.settingName)
      }


      res.status(200).json(JSON.parse(result.output.output_json))
    }).catch(error => {
      console.log('error::::::::::::::::::::>>', error)
      res.status(500).json(JSON.parse(error.originalError.info.message))
    })
  }
}