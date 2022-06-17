const sql = require('mssql');

(async () => {

   let holidays =  [
        {
          Holidaydate: '2022-01-01',
          Description: 'New Year-FD',
          Calendarid: '33',
          Calendarname: 'NMIMS Mumbai',
          Creationflag: 'H',
          Campusid: '50070078',
          Calendaryear: '2022'
        },
        {
          Holidaydate: '2022-01-26',
          Description: 'Republic Day FD',
          Calendarid: '33',
          Calendarname: 'NMIMS Mumbai',
          Creationflag: 'H',
          Campusid: '50070078',
          Calendaryear: '2022'
        },
        {
          Holidaydate: '2022-02-07',
          Description: 'Bharatratna singer Lata-7.2.22',
          Calendarid: '33',
          Calendarname: 'NMIMS Mumbai',
          Creationflag: 'H',
          Campusid: '50070078',
          Calendaryear: '2022'
        },
        {
          Holidaydate: '2022-03-01',
          Description: "Mahashivratri'2022",
          Calendarid: '33',
          Calendarname: 'NMIMS Mumbai',
          Creationflag: 'H',
          Campusid: '50070078',
          Calendaryear: '2022'
        },
        {
          Holidaydate: '2022-03-18',
          Description: "Holi'2022",
          Calendarid: '33',
          Calendarname: 'NMIMS Mumbai',
          Creationflag: 'H',
          Campusid: '50070078',
          Calendaryear: '2022'
        },
        {
          Holidaydate: '2022-04-02',
          Description: "Gudhi Padwa'2022",
          Calendarid: '33',
          Calendarname: 'NMIMS Mumbai',
          Creationflag: 'H',
          Campusid: '50070078',
          Calendaryear: '2022'
        },
        {
          Holidaydate: '2022-04-15',
          Description: "Good Friday'2022",
          Calendarid: '33',
          Calendarname: 'NMIMS Mumbai',
          Creationflag: 'H',
          Campusid: '50070078',
          Calendaryear: '2022'
        },
        {
          Holidaydate: '2022-05-01',
          Description: 'Maharashtra Day FD',
          Calendarid: '33',
          Calendarname: 'NMIMS Mumbai',
          Creationflag: 'H',
          Campusid: '50070078',
          Calendaryear: '2022'
        },
        {
          Holidaydate: '2022-05-03',
          Description: "Ramzan -ID'2022",
          Calendarid: '33',
          Calendarname: 'NMIMS Mumbai',
          Creationflag: 'H',
          Campusid: '50070078',
          Calendaryear: '2022'
        },
        {
          Holidaydate: '2022-08-11',
          Description: "Rakshabhandan'2022",
          Calendarid: '33',
          Calendarname: 'NMIMS Mumbai',
          Creationflag: 'H',
          Campusid: '50070078',
          Calendaryear: '2022'
        },
        {
          Holidaydate: '2022-08-15',
          Description: 'Independence Day FD',
          Calendarid: '33',
          Calendarname: 'NMIMS Mumbai',
          Creationflag: 'H',
          Campusid: '50070078',
          Calendaryear: '2022'
        },
        {
          Holidaydate: '2022-08-19',
          Description: "Dahi Handi'2022",
          Calendarid: '33',
          Calendarname: 'NMIMS Mumbai',
          Creationflag: 'H',
          Campusid: '50070078',
          Calendaryear: '2022'
        },
        {
          Holidaydate: '2022-08-31',
          Description: "Ganesh Chaturthii'2022",
          Calendarid: '33',
          Calendarname: 'NMIMS Mumbai',
          Creationflag: 'H',
          Campusid: '50070078',
          Calendaryear: '2022'
        },
        {
          Holidaydate: '2022-09-09',
          Description: "Anant Chaturdashi'2022",
          Calendarid: '33',
          Calendarname: 'NMIMS Mumbai',
          Creationflag: 'H',
          Campusid: '50070078',
          Calendaryear: '2022'
        },
        {
          Holidaydate: '2022-10-02',
          Description: 'Mahatma Gandhi Jayanti FD',
          Calendarid: '33',
          Calendarname: 'NMIMS Mumbai',
          Creationflag: 'H',
          Campusid: '50070078',
          Calendaryear: '2022'
        },
        {
          Holidaydate: '2022-10-05',
          Description: "Dasara'2022",
          Calendarid: '33',
          Calendarname: 'NMIMS Mumbai',
          Creationflag: 'H',
          Campusid: '50070078',
          Calendaryear: '2022'
        },
        {
          Holidaydate: '2022-10-24',
          Description: "D1-Laxmi Pujan'24.10.22",
          Calendarid: '33',
          Calendarname: 'NMIMS Mumbai',
          Creationflag: 'H',
          Campusid: '50070078',
          Calendaryear: '2022'
        },
        {
          Holidaydate: '2022-10-25',
          Description: 'D2--Diwali  25.10.22',
          Calendarid: '33',
          Calendarname: 'NMIMS Mumbai',
          Creationflag: 'H',
          Campusid: '50070078',
          Calendaryear: '2022'
        },
        {
          Holidaydate: '2022-10-26',
          Description: "D3-Bhaubeej'26.10.22",
          Calendarid: '33',
          Calendarname: 'NMIMS Mumbai',
          Creationflag: 'H',
          Campusid: '50070078',
          Calendaryear: '2022'
        },
        {
          Holidaydate: '2022-12-25',
          Description: 'Christmas F',
          Calendarid: '33',
          Calendarname: 'NMIMS Mumbai',
          Creationflag: 'H',
          Campusid: '50070078',
          Calendaryear: '2022'
        },
        {
          Holidaydate: '2023-01-01',
          Description: 'New Year-FD',
          Calendarid: '33',
          Calendarname: 'NMIMS Mumbai',
          Creationflag: 'H',
          Campusid: '50070078',
          Calendaryear: '2023'
        },
        {
          Holidaydate: '2023-01-26',
          Description: 'Republic Day FD',
          Calendarid: '33',
          Calendarname: 'NMIMS Mumbai',
          Creationflag: 'H',
          Campusid: '50070078',
          Calendaryear: '2023'
        },
        {
          Holidaydate: '2023-05-01',
          Description: 'Maharashtra Day FD',
          Calendarid: '33',
          Calendarname: 'NMIMS Mumbai',
          Creationflag: 'H',
          Campusid: '50070078',
          Calendaryear: '2023'
        },
        {
          Holidaydate: '2023-08-15',
          Description: 'Independence Day FD',
          Calendarid: '33',
          Calendarname: 'NMIMS Mumbai',
          Creationflag: 'H',
          Campusid: '50070078',
          Calendaryear: '2023'
        },
        {
          Holidaydate: '2023-10-02',
          Description: 'Mahatma Gandhi Jayanti FD',
          Calendarid: '33',
          Calendarname: 'NMIMS Mumbai',
          Creationflag: 'H',
          Campusid: '50070078',
          Calendaryear: '2023'
        },
        {
          Holidaydate: '2023-12-25',
          Description: 'Christmas F',
          Calendarid: '33',
          Calendarname: 'NMIMS Mumbai',
          Creationflag: 'H',
          Campusid: '50070078',
          Calendaryear: '2023'
        }
      ];

      // holidays.forEach(function(item){
      //   console.log(item)
      //   let sql = `insert into [asmsoc-mum].holidays (calendar_year, h_date, reason, holiday_type_lid, calendar_id) values(${item.Calendaryear}, ${item.Holidaydate}, ${item.Description}, 1, ${item.Calendarid})` 
      // })

      var config = {
        user: 'sa',
        password: 'Nmims@2019',
        server: 'localhost', 
        database: 'infra_v1_demo',
        port: 1433
    };

     // connect to your database
     sql.connect(config, function (err) {
    
      if (err) console.log(err);

      // create Request object
      var request = new sql.Request();
         
      // query to the database and get the records
      request.query('select * from [dbo].rooms', function (err, recordset) {
          
          if (err) console.log(err)

          // send records as a response
         console.log(recordset)
          
      });
  });

})();