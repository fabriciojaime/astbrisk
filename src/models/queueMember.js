const Common = require('./common');
const Database = require('./database');
const Extension = require('./extension');

module.exports = function queueMember(uniqueid = null, interface = null) {

    return {
        uniqueid: uniqueid,
        interface: interface,
        membername: null,
        state_interface: null,
        queue_name: 'null',
        penalty: null,
        paused: null,
        wrapuptime: null,

        //OK
        makeSafe() {
            this.id = (this.id) ? parseInt(this.id) : null;
            this.name = (this.name) ? Common.sanitizeString(this.name.toUpperCase()) : null;
        },

        //OK
        async getAll(callback = function () { }) {
            let db = Database(),
                qMembers = [];

            try {
                let rows = await db.query('select * from queue_members');
                rows.forEach((row) => {
                    let qMember = queueMember();

                    qMember.uniqueid = row.uniqueid;
                    qMember.interface = row.interface;
                    qMember.membername = row.membername;
                    qMember.state_interface = row.state_interface;
                    qMember.queue_name = row.queue_name;
                    qMember.penalty = row.penalty;
                    qMember.paused = row.paused;
                    qMember.wrapuptime = row.wrapuptime;

                    qMembers.push(qMember);
                });
                callback(qMembers);
                return qMembers;
            } catch (e) {
                console.log(e);
                callback(false);
                return false;
            } finally {
                db.close();
            }
        },

        //OK
        async get(callback = function () { }) {
            let db = Database();

            try {
                let rows = await db.query('select * from queue_members where uniqueid=? or interface=?', [this.uniqueid, this.interface]);
                if (rows.length) {

                    this.uniqueid = rows[0].uniqueid;
                    this.interface = rows[0].interface;
                    this.membername = rows[0].membername;
                    this.state_interface = rows[0].state_interface;
                    this.queue_name = rows[0].queue_name;
                    this.penalty = rows[0].penalty;
                    this.paused = rows[0].paused;
                    this.wrapuptime = rows[0].wrapuptime;

                    callback(this);                    
                    return this;
                } else {
                    callback(false);
                    return false;
                }
            } catch (e) {
                console.log(e);
                callback(false);
                return false;
            } finally {
                db.close();
            }
        },

        //OK
        async create(callback = function () { }) {
            await this.makeSafe();

            let db = Database(),
                sql1 = "insert into queue_members \
                    (interface, membername, state_interface, queue_name, penalty, paused, wrapuptime)\
                    values (?,?,?,?,?,?,?);",

                sqlData1 = [this.interface, this.membername, this.state_interface, this.queue_name, this.penalty, this.paused, this.wrapuptime];

            try {
                this.id = await db.query(sql1, sqlData1); 
                this.id = this.id.insertId;
                callback(this);
                return this;
            } catch (e) {
                console.log(e.sqlMessage);
                callback(false);
                return false;
            } finally {
                db.close();
            }
        },

        //
        async update(callback = function () { }) {
            await this.makeSafe();

            let db = Database(),
                sql1 = "update queue_members set \
                interface =?, membername =?, state_interface =?, queue_name =?, penalty =?, paused =?, wrapuptime =? \
                where uniqueid = ?;",

                sqlData1 = [this.interface, this.membername, this.state_interface, this.queue_name, this.penalty, this.paused, this.wrapuptime, this.uniqueid];

            try {
                await db.query(sql1, sqlData1);
                await this.get();
                callback(this);
                return this;
            } catch (e) {
                console.log(e.sqlMessage);
                callback(false);
                return false;
            } finally {
                db.close();
            }
        },

        //OK
        async delete(callback = function () { }) {
            this.makeSafe();
            let db = Database(),
                sql1 = "delete from queue_members where uniqueid=?";

            try {
                await db.query(sql1, [this.uniqueid]);
                callback(true);
                return true;
            } catch (e) {
                console.log(e);
                db.rollback();
                callback(false);
                return false;
            } finally {
                db.close();
            }
        }

    }
};


/*
queueMember().getAll(e => {
    console.log(e);
});


queueMember(null, 'PJSIP/1004').get(e => {
    console.log(e);
});


queueMember(null, 'PJSIP/1005').create(e => {
    console.log(e);
});


queueMember('6').delete(e => {
    console.log(e)
})

*/