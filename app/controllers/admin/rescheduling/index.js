module.exports = {
    getPage:(req, res)=>{
        res.render('admin/rescheduling/index', {breadcrumbs: req.breadcrumbs})
    }
}