module.exports = {
    getPage:(req, res)=>{
        res.render('admin/time-table-simulation/timetableallocation', {breadcrumbs: req.breadcrumbs, Url:req.originalUrl})
    }
}