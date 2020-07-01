module.exports = (app)=>{
    var Group = require('../models/group')
    
    app.get('/groups', (req, res)=>{
        Group()
            .getAll((result)=>{
                res.render('group',{title: 'Grupos', group: result});
            });
    })

    app.post('/groups/new', (req, res)=>{
        Group(req.body.name)
            .create((result)=>{
                res.render('group',{title: 'Grupo', group: this});
            });
    });
}