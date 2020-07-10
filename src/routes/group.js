const e = require('express');

module.exports = (app) => {
    var Extension = require('../models/extension')
    var Group = require('../models/group')

    app.get('/group', (req, res) => {
        Group()
            .getAll((grp) => {
                res.render('group_list', { title: 'Grupos', group: grp });
            });
    })

    app.get('/group/new', async (req, res) => {
        let exten = await Extension().getAll(),
            group = await Group(),
            extenAvail = { call_members: [], pickup_members: [] },
            extenSlct = { call_members: [], pickup_members: [] };

        exten.forEach(e => {
            let text = (e.callerid) ? `${e.extension} - ${e.callerid}` : e.extension;
            extenAvail.call_members.push({ value: e.extension, text: text });
            extenAvail.pickup_members.push({ value: e.extension, text: text });
        });

        res.render('group_form', { title: 'Grupo', group: group, extenAvail: extenAvail, extenSlct: extenSlct });
    });

    app.get('/group/edit', async (req, res) => {
        let exten = await Extension().getAll(),
            group = await Group(req.query['id']).get(),
            extenAvail = { call_members: [], pickup_members: [] },
            extenSlct = { call_members: [], pickup_members: [] };

        if (group) {
            exten.forEach(e => {
                let text = (e.callerid) ? `${e.extension} - ${e.callerid}` : e.extension;

                if (group.call_members.includes(e.extension)) {
                    extenSlct.call_members.push({ value: e.extension, text: text });
                } else {
                    extenAvail.call_members.push({ value: e.extension, text: text });
                }

                if (group.pickup_members.includes(e.extension)) {
                    extenSlct.pickup_members.push({ value: e.extension, text: text });
                } else {
                    extenAvail.pickup_members.push({ value: e.extension, text: text });
                }
            });
        }

        res.render('group_form', { title: 'Grupo', group: group, extenAvail: extenAvail, extenSlct: extenSlct });
    });

    app.post('/group/submit', async (req, res) => {
        let exten = Group(
            req.body.id,
            req.body.name,
            req.body.call_members.split(','),
            req.body.pickup_members.split(',')
        ),result;

        switch (req.body.operation) {
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