module.exports = (app)=>{
    const Extension = require('../models/extension');  
 
    app.get('/extensions', (req, res)=>{
        Extension()
            .getAll((result)=>{
                res.render('extensions',{title: 'Ramais', extensions: result});
            })
    });
    
    app.get('/extensions/new', (req, res)=>{
        if(req.query['copy']){
            Extension(req.query['copy']).get((result)=>{
                result.extension = null;
                res.render('extension',{title: `Cópia do ramal <${req.query['copy']}>`, extension: result});
            });
        }else{
            res.render('extension',{title: 'Novo Ramal', extension: Extension()});
        }
    });
    
    app.get('/extensions/edit', (req, res)=>{
        Extension(req.query['id'])
            .get((result)=>{
                res.render('extension',{title: 'Dados do Ramal', extension: result});
            });
    });

    app.post('/extensions/create', (req, res)=>{
        Extension(
            req.body.extension,
            req.body.callerid,
            req.body.password,
            req.body.context,
            req.body.codecs,
            req.body.max_contacts,
            req.body.call_group,
            req.body.pickup_group,
            req.body.voicemail
        )
            .create((result)=>{
                res.send(result);
            });
    }); 

    app.post('/extensions/update', (req, res)=>{
        Extension(
            req.body.extension,
            req.body.callerid,
            req.body.password,
            req.body.context,
            req.body.codecs,
            req.body.max_contacts,
            req.body.call_group,
            req.body.pickup_group,
            req.body.voicemail
        )
            .update((result)=>{
                res.send(result);;
            });
    });

    app.post('/extensions/delete', (req, res)=>{
        Extension(req.body.extension)
            .delete((result)=>{
                res.send(result);;
            });
    }); 
}
  