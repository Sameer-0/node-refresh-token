module.exports = {
    getPage:(req, res)=>{
        res.render('admin/timeTableSimulation/allocation', {breadcrumbs: req.breadcrumbs, Url: req.originalUrl})
    }
}