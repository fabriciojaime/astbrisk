//const { isNull } = require('util');

const { concat } = require('mysql2/lib/constants/charset_encodings');

module.exports = (app)=>{
    const Queue = require('../models/queue'),
            Extension = require('../models/extension'),
            queueMember = require('../models/queueMember');
 
    app.get('/queue', async (req, res)=>{
        let qm = await queueMember().getAll();
        Queue()
            .getAll((result)=>{
                res.render('queue_list',{title: 'Filas', queues: result, qmember: qm});
            })
    });
    
    app.get('/queue/new', async (req, res) => {
        let t = (req.query['copy']) ? `Cópia da Fila <${req.query['copy']}>` : 'Nova Fila',
            e = (req.query['copy']) ? await Queue(req.query['copy']).get() : Queue();
            res.render('queue_form',{title: t, queue: e});
    });    
    
    app.get('/queue/edit', async (req, res)=>{
        let e = await Extension().getAll();
        let qm = await queueMember().getAll();
        let q = await Queue(req.query['id']).get();
            res.render('queue_form',{title: 'Dados da Fila', queue: q, extensions: e, queueMember: qm})
    });
    
    app.post('/queue/submit', async (req, res)=>{
        let result,
            queue = Queue(),
            queuemember = queueMember(),
            exten = Extension(
                req.body.member
            );
        
        //GENERAL
        queue.id = req.body.id;
        queue.name = req.body.name;
        queue.strategy = req.body.strategy;
        (req.body.autofill == 'yes')? queue.autofill = 'yes': queue.autofill = null;
        (req.body.weight == 0)? queue.weight = null: queue.weight == ''? queue.weight = null: queue.weight = req.body.weight;
        (req.body.servicelevel == 0)? queue.servicelevel = null: queue.servicelevel == ''? queue.servicelevel = null: queue.servicelevel = req.body.servicelevel;
        queue.monitor_type = 'MixMonitor';
        (req.body.record == 'yes')? queue.monitor_format ='wav':queue.monitor_format = null;
        queue.setinterfacevar = 'yes';
        queue.setqueuevar = 'yes';
        queue.setqueueentryvar = 'yes';     
        
        //MEMBER
        queue.timeout = req.body.timeout;
        queue.timeoutpriority = req.body.timeoutpriority;
        (req.body.retry == 0)? queue.retry = null: queue.retry == ''? queue.retry = null: queue.retry = req.body.retry;
        queue.ringinuse = req.body.ringinuse;
        queue.autopause = req.body.autopause;
        (req.body.wrapuptime == 0)? queue.wrapuptime = null: queue.wrapuptime == ''? queue.wrapuptime = null: queue.wrapuptime = req.body.wrapuptime;
        queue.reportholdtime = req.body.reportholdtime;
        (req.body.penaltymemberslimit == 0)? queue.penaltymemberslimit = null: queue.penaltymemberslimit == ''? queue.penaltymemberslimit = null: queue.penaltymemberslimit = req.body.penaltymemberslimit;
        queue.defaultrule = req.body.defaultrule;

        //USER
        queue.musiconhold = req.body.musiconhold;
        queue.context = req.body.context;  
        (req.body.joinempty == undefined)? queue.joinempty = null: queue.joinempty = req.body.joinempty.toString();
        (req.body.leavewhenempty == undefined)? queue.leavewhenempty = null: queue.leavewhenempty = req.body.leavewhenempty.toString();
        queue.announce_position = req.body.announce_position;
        queue.announce_holdtime = req.body.announce_holdtime;
        (req.body.announce_frequency == 0)? queue.announce_frequency = null: queue.announce_frequency == ''? queue.announce_frequency = null: queue.announce_frequency = req.body.announce_frequency;
        (req.body.announce_round_seconds == 0)? queue.announce_round_seconds = null: queue.announce_round_seconds == ''? queue.announce_round_seconds = null: queue.announce_round_seconds = req.body.announce_round_seconds;
        queue.announce_to_first_user = req.body.announce_to_first_user;
        
        
        //ADDMEMBER        
        let m = await exten.get();
        queuemember.interface = 'PJSIP/'+req.body.member;
        queuemember.membername = m.callerid;
        queuemember.state_interface = 'PJSIP/'+req.body.member;
        queuemember.queue_name = req.body.name;
        

        switch(req.body.operation){
            case 'create':
                result = await queue.create();
                break;
            case 'update':
                result = await queue.update();
                break;
            case 'delete':
                result = await queue.delete();
                break;
            case 'addmember':
                await queuemember.create();
                result = queue.id;
                break;
            case 'deletemember':
                let qmget = await queuemember.get();
                queuemember.uniqueid = qmget.uniqueid;
                await queuemember.delete();
                result = queue.id;
                break;
            default:
                result = false;
        }

        res.send(result);
    });
    
} 