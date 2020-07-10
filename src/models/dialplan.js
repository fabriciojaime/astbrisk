const Common = require('./Common'),
    Database = require('./database');
const { getDefaultFlags } = require('mysql2/lib/connection_config');

module.exports = function Dialplan(context, exten, proc = []) {
    return {
        id: null,
        context,
        exten,
        proc: proc,

        makeSafe() {
            this.context = (this.context) ? Common.sanitizeString(this.context.toUpperCase().replace(/\s/g, "-")) : null;
            this.exten = (this.context) ? this.exten.toUpperCase() : null;
        },

        //OK
        async get(callback = function () { }) {
            let db = Database();

            try {
                let rows = await db.query('select * from extensions where context=? and exten=?', [this.context, this.exten]);
                if (rows.length) {
                    this.id = `${this.context},${this.exten}`;
                    rows.forEach(async r => {
                        await this.proc.push({
                            id: r.id,
                            priority: r.priority,
                            app: r.app,
                            appdata: r.appdata
                        });
                    });

                    callback(this);
                    return this;
                } else {
                    callback(false);
                    return false;
                }
            } catch (e) {
                console.log(e.sqlMessage);
                callback(false);
                return false;
            } finally {
                db.close();
            }
        },

        async getAll(callback = function () { }) {
            let db = Database();

            try {
                let rows = await db.query('select * from extensions');
                if (rows.length) {
                    rows.forEach(async r => {
                        await this.proc.push({
                            id: r.id,
                            context: r.context,
                            exten: r.exten,
                            priority: r.priority,
                            app: r.app,
                            appdata: r.appdata
                        });
                    });
                    this.proc['brief'] = await db.query('select context, exten, count(exten) as procs from asterisk.extensions group by context, exten;');
                    callback(this.proc);
                    return this.proc;
                } else {
                    callback(false);
                    return false;
                }
            } catch (e) {
                console.log(e.sqlMessage);
                callback(false);
                return false;
            } finally {
                db.close();
            }
        },

        async getByContext(callback = function () { }) {
            let db = Database();

            try {
                let rows = await db.query('select * from extensions where context=?', [this.context]);
                if (rows.length) {
                    rows.forEach(async r => {
                        await this.proc.push({
                            id: r.id,
                            exten: r.exten,
                            priority: r.priority,
                            app: r.app,
                            appdata: r.appdata
                        });
                    });

                    callback(this);
                    return this;
                } else {
                    callback(false);
                    return false;
                }
            } catch (e) {
                console.log(e.sqlMessage);
                callback(false);
                return false;
            } finally {
                db.close();
            }
        },

        async create(callback = function () { }) {
            let db = Database(),
                sql = "insert into extensions (context, exten, priority, app, appdata) values (?, ?, ?, ?, ?)";
            try {
                await this.makeSafe();
                await db.beginTransaction();
                //A CADA ITERAÇÃO DE 'proc' FEITA PELO 'for', 'idx' SERÁ O ÍNDICE E 'proc' SERÁ O VALOR
                for (let [idx, proc] of this.proc.entries()) {
                    await db.query(sql, [this.context, this.exten, idx + 1, proc.app, proc.appdata]);
                }
                await db.commit();
                await this.get();
                callback(this);
                return this;
            } catch (e) {
                console.log(e.sqlMessage);
                db.rollback();
                callback(false);
                return false;
            } finally {
                db.close();
            }

        },

        async update(callback = function () { }) {
            let db = Database();

            let oldDpln = await Dialplan(this.id.split(',')[0], this.id.split(',')[1]).get();

            if (oldDpln) {
                try {
                    await db.beginTransaction();
                    if (await oldDpln.delete()) {
                        if( await this.create()){
                            db.commit();
                            callback(this);
                            return this;
                        }else{
                            callback(false);
                            return false;
                        }
                    } else {
                        callback(false);
                        return false;
                    }
                } catch (e) {
                    console.log(e.sqlMessage);
                    db.rollback();
                    callback(false);
                    return false;
                } finally {
                    db.close();
                }
            } else {
                callback(false);
                return false;
            }
        },

        async delete(callback = function () { }, mask = false) {
            let db = Database(),
                sql = (this.context) ? (this.exten) ? 'delete from extensions where context=? and exten=?' : 'delete from extensions where context=?' : false;

            if (sql) {
                try {
                    let result = await db.query(sql, [this.context, this.exten]);
                    callback(result.affectedRows);
                    return result.affectedRows;
                } catch (e) {
                    console.log(e.sqlMessage);
                    callback(false);
                    return false;
                } finally {
                    db.close();
                }
            } else {
                db.close();
                callback(false);
                return false;
            }
        }
    }
}