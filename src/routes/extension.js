module.exports = (app)=>{
    const Extension = require('../models/extension');  
    const Group = require('../models/group');  
    const Dialplan = require('../models/dialplan');  
 
    app.get('/extension', (req, res)=>{
        Extension()
            .getAll((result)=>{
                res.render('extension_list',{title: 'Ramais', extensions: result});
            })
    });
    
    app.get('/extension/new', async (req, res)=>{
        let t = (req.query['copy']) ? `Cópia do ramal <${req.query['copy']}>` : 'Novo Ramal',
            e = (req.query['copy']) ? await Extension(req.query['copy']).get() : Extension(),
            g = await Group().getAllNoMembers(),
            c = await Dialplan().getContexts();
            e.extension = null; 
            res.render('extension_form',{title: t, extension: e, context: c, group: g});
    });
    
    app.get('/extension/edit', async (req, res)=>{
        let e = await Extension(req.query['id']).get(),
            g = await Group().getAllNoMembers(),
            c = await Dialplan().getContexts()
            res.render('extension_form',{title: 'Dados do ramal', extension: e, context: c, group: g})
    });

    app.post('/extension/submit', async (req, res)=>{
        let result,
            exten = Extension(
                req.body.extension,
                req.body.callerid,
                req.body.password,
                req.body.context,
                req.body.codecs,
                req.body.max_contacts,
                req.body.call_group,
                req.body.pickup_group,
                req.body.voicemail
            );

        switch(req.body.operation){
            case 'create':
                result = await exten.create();
                break;
            case 'update':
                result = await exten.update();
                break;
            case 'delete':
                result = await exten.delete();
                break;
            default:
                result = false;
        }

        res.send(result);
    });
} 