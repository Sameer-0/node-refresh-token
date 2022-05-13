const sql = require('mssql');

(async () => {
    try {
        // make sure that any items are correctly URL encoded in the connection string
        await sql.connect('Server=SOD-TEST,1433;Database=infra_v_1_0_2_1;User Id=sa;Password=Nmims@2019;Encrypt=false')
        const result = await sql.query`select 'KAPIL SHARMA' AS name;`
        console.dir(result)
    } catch (err) {
       console.log("ERROR>>>>>>>>>>> ", err)
    }
})();