module.exports = (app)=>{
    var extModel = app.src.models.extension;  
    var data = null;    

    app.get('/extensions', (req, res)=>{
        extModel.rExtensions((err,result)=>{
            data = (err)?'Não foi possível acessar os dados de ramais':result;
            res.render('extensions',{title: 'Ramais', response: data});
        })
    });

    app.get('/extensions/:id', (req, res)=>{
        extModel.rExtension(req.params.id,(err,result)=>{
            data = (err)?'Não foi possível acessar os dados de ramal':result;
            res.render('extensions',{title: 'Ramais', response: data});
        })
    });
}
  