const Common = require('./Common'),
    Database = require('./database'),
    AMI = require('./ami'),
    fs = require('fs');

module.exports = function Dialplan(context, exten, procs = []) {
    return {
        id: null,
        context,
        exten,
        procs: procs,

        makeSafe() {
            this.context = (this.context) ? Common.sanitizeString(this.context.toLowerCase().replace(/\s/g, "-")) : null;
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
                        await this.procs.push({
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
                        await this.procs.push({
                            id: r.id,
                            context: r.context,
                            exten: r.exten,
                            priority: r.priority,
                            app: r.app,
                            appdata: r.appdata
                        });
                    });
                    this.procs['brief'] = await db.query('select context, exten, count(exten) as procss from asterisk.extensions group by context, exten;');
                    callback(this.procs);
                    return this.procs;
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
                    let dlpnFull = [{context: this.context}];
                    rows.forEach(async r => {
                        dlpnFull.push(
                            [{
                                exten: r.exten,
                                procs:{
                                    app: r.app,
                                    appdata: r.appdata
                                }
                            }]
                        );
                    });

                    callback(dlpnFull);
                    return dlpnFull;
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

        async getContexts(callback = function () { }) {
            let db = Database();

            try {
                return await db.query('select distinct context from extensions');
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
                //A CADA ITERAÇÃO DE 'procs' FEITA PELO 'for', 'idx' SERÁ O ÍNDICE E 'procs' SERÁ O VALOR
                for (let [idx, procs] of this.procs.entries()) {
                    await db.query(sql, [this.context, this.exten, idx + 1, procs.app, procs.appdata]);
                }
                
                await db.commit();

                this.syncDialplan();

                await this.get();
                callback(this);
                return this;
            } catch (e) {
                console.log(e);
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

                    this.syncDialplan();

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
        },
        
        async syncDialplan(callback = function () { }){
            let ami = AMI(),
                ctx = '',
                ctxDB = [];

            // OBTER CONTEXTO DO DB E GRAVAR NO ARQUIVO 
            ctxDB = await this.getContexts();
            for (let [idx, c] of ctxDB.entries()) {
                ctx += `[${c.context}]\nSwitch=Realtime/@\n`;
            }
            // ALTERAR DESTINO EXTENSIONS.CONF
            //fs.writeFileSync('C:/Users/fabri/Documents/DEV/Projects/ASTERISK/external/extensions.conf', ctx);
            fs.writeFileSync('/etc/asterisk/extensions.conf', ctx);

            await ami.action({'action':'command','command':'dialplan reload'});
            
            ami.close();
        }
    }
}