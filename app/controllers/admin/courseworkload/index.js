const CourseWorkload = require('../../../models/CourseWorkload')
const AcadYear = require('../../../models/AcademicYear')
const Programs = require('../../../models/Programs')
const AcadSession = require('../../../models/AcadSession')
const Tanent =  require('../../../models/Tanent')
const path = require("path");
var soap = require("soap");
module.exports = {
    getPage: (req, res) => {
        Promise.all([CourseWorkload.getCount(res.locals.slug), AcadYear.fetchAll(), Programs.fetchAll(100, res.locals.slug), AcadSession.fetchAll(1000)]).then(result => {
            res.render('admin/courseworkload/index', {
                pageCount: result[0].recordset[0].count,
                acadYear: result[1].recordset[0].input_acad_year,
                programList: result[2].recordset,
                AcadSessionList: result[3].recordset
            })
        })
    },

    fetchFromSAP:(req, res, next)=>{
        console.log('REQ::::::::::::::::', req.body)
        const {acadYear, program_lid, acad_session_lid } = req.body;

        var wsdlUrl = path.join(
          process.env.WSDL_PATH,
          "zacad_student_workload_seh.wsdl"
        );

        console.log('wsdlUrl::::::::::::::::', wsdlUrl)

        Tanent.fetchForCourseWorkload(res.locals.slug).then(result=>{
            console.log('Result::::::::::::::::>>>', result.recordset[0])
            soap.createClient(wsdlUrl, async function (err, soapClient) {
              if (err) {
                next(err);
              }
              console.log('soapClient:::::::::',soapClient)

              await soapClient.ZACAD_STUDENT_WORKLOAD.ZACAD_STUDENT_WORKLOAD.ZACAD_STUDENT_WORKLOAD({
                  YEAR: acadYear,
                  CAMPUS_ID: result.recordset[0].campus_id_str,
                  SCHOOL_ID: result.recordset[0].org_id_str,
                  SESSION: acad_session_lid,
                  PROGRAM_ID: program_lid,
                },
                async function (err, result) {
                  let output = await result;
                  console.log('output:::::::::::::::::::::>>>',output)
  
                }
              );
            });


        })

    }
}