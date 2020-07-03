module.exports = (app)=>{
    const Extension = require('../models/extension');  
    const Group = require('../models/group');  
 
    app.get('/extensions', (req, res)=>{
        Extension()
            .getAll((result)=>{
                res.render('extensions',{title: 'Ramais', extensions: result});
            })
    });
    
    app.get('/extensions/new', async (req, res)=>{
        let t = (req.query['copy']) ? `Cópia do ramal <${req.query['copy']}>` : 'Novo Ramal',
            e = (req.query['copy']) ? await Extension(req.query['copy']).get() : Extension(),
            g = await Group().getAllNoMembers();
            e.extension = null; 
            res.render('extension',{title: t, extension: e, group: g});
    });
    
    app.get('/extensions/edit', async (req, res)=>{
        let e = await Extension(req.query['id']).get(),
            g = await Group().getAllNoMembers();
            res.render('extension',{title: 'Dados do ramal', extension: e, group: g})
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
  