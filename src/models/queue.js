const Common = require('./common');
const Database = require('./database');
const Extension = require('./extension');

module.exports = function Queue(id = null, name = null) {

    return {
        id: id,
        name: name,
        strategy: null,
        autofill: null,
        weight: null,
        servicelevel: null,

        timeout: null,
        timeoutpriority: null,
        retry: null,

        musiconhold: null,
        context: null,
        ringinuse: null,
        reportholdtime: null,
        wrapuptime: null,
        autopause: null,
        joinempty: null,
        leavewhenempty: null,

        announce_position: null,
        announce_holdtime: null,
        announce_round_seconds: null,
        announce_frequency: null,
        announce_to_first_user: null,

        monitor_type: null,
        monitor_format: null,

        setinterfacevar: null,
        setqueuevar: null,
        setqueueentryvar: null,
        penaltymemberslimit: null,
        defaultrule: null,

        //OK
        makeSafe() {
            this.id = (this.id) ? parseInt(this.id) : null;
            this.name = (this.name) ? Common.sanitizeString(this.name.toUpperCase()) : null;
        },

        //OK
        async getAll(callback = function () { }) {
            let db = Database(),
                queueList = [];

            try {
                let rows = await db.query('select * from queues');
                rows.forEach((row) => {
                    let queue = Queue();
                    queue.id = row.id;
                    queue.name = row.name;
                    queue.strategy = row.strategy;
                    queue.autofill = row.autofill;
                    queue.weight = row.weight;
                    queue.servicelevel = row.servicelevel;
                    queue.timeout = row.timeout;
                    queue.timeoutpriority = row.timeoutpriority;
                    queue.retry = row.retry;
                    queue.musiconhold = row.musiconhold;
                    queue.context = row.context;
                    queue.ringinuse = row.ringinuse;
                    queue.reportholdtime = row.reportholdtime;
                    queue.wrapuptime = row.wrapuptime;
                    queue.autopause = row.autopause;
                    queue.joinempty = row.joinempty;
                    queue.leavewhenempty = row.leavewhenempty;
                    queue.announce_position = row.announce_position;
                    queue.announce_holdtime = row.announce_holdtime;
                    queue.announce_round_seconds = row.announce_round_seconds;
                    queue.announce_frequency = row.announce_frequency;
                    queue.announce_to_first_user = row.announce_to_first_user;
                    queue.monitor_type = row.monitor_type;
                    queue.monitor_format = row.monitor_format;
                    queue.setinterfacevar = row.setinterfacevar;
                    queue.setqueuevar = row.setqueuevar;
                    queue.setqueueentryvar = row.setqueueentryvar;
                    queue.penaltymemberslimit = row.penaltymemberslimit;
                    queue.defaultrule = row.defaultrule;

                    queueList.push(queue);
                });
                callback(queueList);
                return queueList;
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
                let rows = await db.query('select * from queues where id=? or name=?', [this.id, this.name]);
                if (rows.length) {
                    this.id = rows[0].id;
                    this.name = rows[0].name;
                    this.strategy = rows[0].strategy;
                    this.autofill = rows[0].autofill;
                    this.weight = rows[0].weight;
                    this.servicelevel = rows[0].servicelevel;
                    this.timeout = rows[0].timeout;
                    this.timeoutpriority = rows[0].timeoutpriority;
                    this.retry = rows[0].retry;
                    this.musiconhold = rows[0].musiconhold;
                    this.context = rows[0].context;
                    this.ringinuse = rows[0].ringinuse;
                    this.reportholdtime = rows[0].reportholdtime;
                    this.wrapuptime = rows[0].wrapuptime;
                    this.autopause = rows[0].autopause;
                    this.joinempty = rows[0].joinempty;
                    this.leavewhenempty = rows[0].leavewhenempty;
                    this.announce_position = rows[0].announce_position;
                    this.announce_holdtime = rows[0].announce_holdtime;
                    this.announce_round_seconds = rows[0].announce_round_seconds;
                    this.announce_frequency = rows[0].announce_frequency;
                    this.announce_to_first_user = rows[0].announce_to_first_user;
                    this.monitor_type = rows[0].monitor_type;
                    this.monitor_format = rows[0].monitor_format;
                    this.setinterfacevar = rows[0].setinterfacevar;
                    this.setqueuevar = rows[0].setqueuevar;
                    this.setqueueentryvar = rows[0].setqueueentryvar;
                    this.penaltymemberslimit = rows[0].penaltymemberslimit;
                    this.defaultrule = rows[0].defaultrule;

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
                sql1 = "insert into queues \
                    (name, strategy, autofill, weight, servicelevel, timeout,\
                     timeoutpriority, retry, musiconhold, context, ringinuse, \
                     reportholdtime, wrapuptime, autopause, joinempty, leavewhenempty, \
                     announce_position, announce_holdtime, announce_round_seconds, \
                     announce_frequency, announce_to_first_user, monitor_type, monitor_format, setinterfacevar, setqueuevar, setqueueentryvar, penaltymemberslimit, defaultrule) \
                     values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);",

                sqlData1 = [this.name, this.strategy, this.autofill, this.weight, this.servicelevel, this.timeout, this.timeoutpriority, this.retry,
                this.musiconhold, this.context, this.ringinuse, this.reportholdtime, this.wrapuptime, this.autopause, this.joinempty, this.leavewhenempty,
                this.announce_position, this.announce_holdtime, this.announce_round_seconds, this.announce_frequency, this.announce_to_first_user, this.monitor_type,
                this.monitor_format, this.setinterfacevar, this.setqueuevar, this.setqueueentryvar, this.penaltymemberslimit, this.defaultrule];

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

        //OK
        async update(callback = function () { }) {
            await this.makeSafe();

            let db = Database(),
                sql1 = "update queues set \
                    name =?, strategy =?, autofill =?, weight =?, servicelevel =?, timeout =?,\
                     timeoutpriority =?, retry =?, musiconhold =?, context =?, ringinuse =?, \
                     reportholdtime =?, wrapuptime =?, autopause =?, joinempty =?, leavewhenempty =?, \
                     announce_position =?, announce_holdtime =?, announce_round_seconds =?, \
                     announce_frequency =?, announce_to_first_user =?, monitor_type =?, monitor_format =?,\
                      setinterfacevar =?, setqueuevar =?, setqueueentryvar =?, penaltymemberslimit =?, defaultrule =? where id = ?;",

                sqlData1 = [this.name, this.strategy, this.autofill, this.weight, this.servicelevel, this.timeout, this.timeoutpriority, this.retry,
                this.musiconhold, this.context, this.ringinuse, this.reportholdtime, this.wrapuptime, this.autopause, this.joinempty, this.leavewhenempty,
                this.announce_position, this.announce_holdtime, this.announce_round_seconds, this.announce_frequency, this.announce_to_first_user, this.monitor_type,
                this.monitor_format, this.setinterfacevar, this.setqueuevar, this.setqueueentryvar, this.penaltymemberslimit, this.defaultrule, this.id];

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
                sql1 = "delete from queues where id=?";

            try {
                await db.query(sql1, [this.id]);
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
var e = Queue();
e.id = null;
e.name = 'Fila22';
e.strategy = "ringall";

e.create(e => {
     console.log(e)
})
*/