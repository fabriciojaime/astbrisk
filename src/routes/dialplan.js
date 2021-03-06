module.exports = (app) => {
    var Extension = require('../models/extension')
    var Dialplan = require('../models/dialplan')

    app.get('/dialplan', (req, res) => {
        Dialplan()
            .getAll((dlp) => {
                res.render('dialplan_list', { title: 'Planos de discagem', dialplan: dlp });
            });
    })

    app.get('/dialplan/new', (req, res) => {
        res.render('dialplan_form', { title: 'Planos de discagem', dialplan: Dialplan() });
    })

    app.get('/dialplan/edit', async (req, res) => {
        if(req.query['context'] && req.query['exten']){
            let dlpn = await Dialplan( req.query['context'], req.query['exten']).get();
            res.render('dialplan_form', { title: 'Planos de discagem', dialplan: dlpn });
        }else if(req.query['context']){
            let dlpn = await Dialplan( req.query['context']).getByContext();
            res.render('dialplan_form', { title: 'Planos de discagem', dialplan: dlpn });
        }
    })

    app.post('/dialplan/submit', async (req, res) => {
        let dpln = Dialplan(req.body.context,req.body.exten),
        result;

        dpln.id = req.body.id;
        req.body.app = (typeof req.body.app === "string")?[req.body.app]:req.body.app;
        req.body.appdata = (typeof req.body.appdata === "string")?[req.body.appdata]:req.body.appdata;
        for(let[idx,val] of req.body.app.entries()){
            await dpln.procs.push({app: val, appdata: req.body.appdata[idx]});
        }

        switch (req.body.operation) {
            case 'create':
                result = await dpln.create();
                break;
            case 'update':
                result = await dpln.update();
                break;
            case 'delete':
                result = Boolean(await dpln.delete());
                break;
            default:
                result = false;
        }

        res.send(result);
    })
}