const path = require("path");
const soap = require("soap");

(async () => {

    var wsdlUrl ="F:/INFRA/infra_v2/wsdl/zhr_holiday_date_jp_bin_sep_20220509.wsdl";
      console.log('wsdlUrl::::::::::::::::', wsdlUrl)    

      let soapClient = await new Promise(resolve => {
        soap.createClient(wsdlUrl, async function (err, soapClient) {
          if (err) {
            next(err);
          }
          resolve(soapClient);
        })
      })  

      // console.log('soapClient:::::::::::::::::>>>',soapClient)

      let holidayList = await new Promise(async resolve => {
        await soapClient.ZhrHolidayDateJp({
            Acadyear: "2022",
            Campusid: "50070078",
            Schoolobjectid: "00004533",
          },
          async function (err, result) {
            let output = await result;
            console.log('output::::::::::::::>>> ', output.Output.item)
            resolve(1);
          });
      })
})();

