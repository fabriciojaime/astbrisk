const Common = require('./common');
const Database = require('./database');

module.exports = function Extension(extension, callerid, password, context, codecs, max_contacts, call_group, pickup_group, voicemail, user_agent, last_use, status) {
    return {
        extension: extension,
        callerid: callerid,
        password: password,
        context: context,
        codecs: codecs,
        max_contacts: max_contacts,
        call_group: call_group,
        pickup_group: pickup_group,
        voicemail: voicemail,
        user_agent: user_agent,
        last_use: last_use,
        status: status,

        makeReadable() {
            this.callerid       = (this.callerid) ? (this.callerid.includes('<')) ? this.callerid.split('<', 1).toString().trim() : this.callerid : null;
            this.codecs         = (this.codecs) ? (this.codecs.includes(',')) ? this.codecs.split(',') : this.codecs : null;
            this.call_group     = (this.call_group) ? (this.call_group.includes(',')) ? this.call_group.split(',') : this.call_group : null;
            this.pickup_group   = (this.pickup_group) ? (this.pickup_group.includes(',')) ? this.pickup_group.split(',') : this.pickup_group : null;
            this.status         = (this.user_agent) ? 'Em uso' : 'Indiponível';
            this.last_use       = (this.last_use) ? Common.formatDate(this.last_use) : this.last_use;
        },

        makeSafe() {
            this.callerid = (this.callerid) ? `${this.callerid} <${this.extension}>` : null;
            this.password = (this.password.match(/^[0-9]{6}/)) ? this.password : Math.floor(100000 + Math.random() * 900000);
            this.call_group = (this.call_group) ? (typeof this.call_group === 'string') ? this.call_group : this.call_group.join() : null;
            this.pickup_group = (this.pickup_group) ? (typeof this.pickup_group === 'string') ? this.pickup_group : this.pickup_group.join() : null;
        },

        async getAll(callback = function(){}) {
            let db = Database(),
                extList = [];

            try {
                let rows = await db.query('select * from pjsip_extensions');
                rows.forEach((row) => {
                    let ext = Extension(
                        row.extension,
                        row.callerid,
                        row.password,
                        row.context,
                        row.codecs,
                        row.max_contacts,
                        row.call_group,
                        row.pickup_group,
                        row.voicemail,
                        row.user_agent,
                        row.last_use
                    );
                    ext.makeReadable();
                    extList.push(ext);
                });
                callback(extList);
                return extList;
            } catch (e) {
                console.log(e);
                callback(false);
                return extList;
            } finally {
                db.close();
            }
        },

        async get(callback = function(){}, extension) {
            let db = Database();

            this.extension = (extension) ? extension : this.extension;
            
            try {
                let rows = await db.query('select * from pjsip_extensions where extension=?', [this.extension]);
                if(rows.length){
                    this.extension = rows[0].extension;
                    this.callerid = rows[0].callerid;
                    this.password = rows[0].password;
                    this.context = rows[0].context;
                    this.codecs = rows[0].codecs;
                    this.max_contacts = rows[0].max_contacts;
                    this.call_group = rows[0].call_group;
                    this.pickup_group = rows[0].pickup_group;
                    this.voicemail = rows[0].voicemail;
                    this.user_agent = rows[0].user_agent;
                    this.last_use = rows[0].last_use;
                    await this.makeReadable();
                    callback(this);
                    return this;
                }else{
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

        async create(callback = function(){}) {
            await this.makeSafe();

            let db = Database(),
                sql1 = "insert into ps_endpoints (id,aors,auth,context,disallow,allow,outbound_auth,rewrite_contact,rtp_symmetric,callerid,call_group,pickup_group,language) values (?,?,?,?,?,?,?,?,?,?,?,?,?);",
                sql2 = "insert into ps_auths (id,auth_type,password,username) values (?,?,?,?)",
                sql3 = "insert into ps_aors (id,max_contacts,authenticate_qualify) values (?,?,?)",
                sqlData1 = [this.extension, this.extension, this.extension, this.context, 'all', this.codecs, this.extension, 'yes', 'yes', this.callerid, this.call_group, this.pickup_group, 'pt-br'],
                sqlData2 = [this.extension, 'userpass', this.password, this.extension],
                sqlData3 = [this.extension, this.max_contacts, 'yes'];

            try {
                await db.beginTransaction();
                await db.query(sql1, sqlData1);
                await db.query(sql2, sqlData2);
                await db.query(sql3, sqlData3);
                await db.commit();
                callback(this.extension);
                return this.extension;
            } catch (e) {
                console.log(e.sqlMessage);
                db.rollback();
                callback(false);
                return false;
            } finally {
                db.close();
            }
        },

        async update(callback = function(){}) {
            await this.makeSafe();

            let db = Database(),
                sql1 = "update ps_endpoints set context=?,allow=?,callerid=?,call_group=?,pickup_group=? where id=?",
                sql2 = "update ps_auths set password=? where id=?",
                sql3 = "update ps_aors set max_contacts=? where id=?",
                sqlData1 = [this.context, this.codecs, this.callerid, this.call_group, this.pickup_group, this.extension],
                sqlData2 = [this.password, this.extension],
                sqlData3 = [this.max_contacts, this.extension];

            try {
                await db.beginTransaction();
                await db.query(sql1, sqlData1);
                await db.query(sql2, sqlData2);
                await db.query(sql3, sqlData3);
                await db.commit();
                callback(this.extension);
                return this.extension;
            } catch (e) {
                console.log(e.sqlMessage);
                db.rollback();
                callback(false);
                return false;
            } finally {
                db.close();
            }            
        },
        
        async delete(callback = function(){}) {
            let db = Database();
            
            try {
                await db.beginTransaction();
                await db.query("delete from ps_endpoints where id=?", [this.extension]);
                await db.query("delete from ps_auths where id=?", [this.extension]);
                await db.query("delete from ps_aors where id=?", [this.extension]);
                await db.commit();
                callback(true);
                return true;
            } catch (e) {
                console.log(e.sqlMessage);
                db.rollback();
                callback(false);
                return false;
            } finally {
                db.close();
            }
        }
    }
};