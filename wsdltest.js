const path = require("path");
const soap = require("soap");

(async () => {

    var wsdlUrl ="D:/INFRAPROJECT/infra_v2/wsdl/zapi_faculty_availability_bin_sqh_20220728.wsdl";
      console.log('wsdlUrl::::::::::::::::', wsdlUrl)    

      let soapClient = await new Promise(resolve => {
        soap.createClient(wsdlUrl, async function (err, soapClient) {
          resolve(soapClient);
        })
      }).catch(e => console.log("Error>>> ", e))  



      let resourceParam = {
        ResourceType: 'P',
        ResourceId: '14210011',
        StartDate: '2022-07-21',
        EndDate: '2022-07-28',
        StartTime: '', //moment(lecture.start_time, 'hh:mm:ss A').format('HH:mm:ss'),
        EndTime: '' //moment(lecture.end_time, 'hh:mm:ss A').format('HH:mm:ss'),
    }

    //console.log(soapClient)
    //return false;
 
    let sapResult = await new Promise((resolve, reject) => {
        soapClient.ZapiFacultyAvailability(resourceParam, async (err, result) => {
            if (err) throw err;
            console.log('>>>>>>>>>> Awaiting result from SAP <<<<<<<<<<')

            let sapResult = await result.EtResoAvaiInfo

            if (!sapResult) {
                sapResult = [];
            } else {
                sapResult = sapResult.item
            }
            resolve(sapResult)
        })
    })

    console.log('sapResult>>> ', sapResult)


})();

