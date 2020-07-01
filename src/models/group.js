const Common = require('./Common');
const Database = require('./database');
const Extension = require('./extension');

function Group(id, name, members) {
    return {
        id: id,
        name: name,
        members: members,

        makeSafe() {
            this.name = (this.name) ? Common.sanitizeString(this.name.toUpperCase()) : null;
        },

        async getAll(callback) {
            let db = Database(),
                grpList = [];

            try {
                let rows = await db.query('select id, g.name, (select group_concat(id) from ps_endpoints where FIND_IN_SET(g.id,call_group) > 0	) as call_group, (select group_concat(id) from ps_endpoints where FIND_IN_SET(g.id,pickup_group) > 0 ) as pickup_group from asterisk.groups as g');
                rows.forEach((row)=>{
                    grpList.push( Group(row.id, row.name, {call_group: row.call_group, pickup_group: row.pickup_group}) );
                });
                callback(grpList);
            } catch (e) {
                callback(false);
                console.log(e);
            } finally {
                db.close();
            }
        },

        async get(callback, id) {
            let db = Database(),
            grpList = []
            sql = 'select id, g.name, (select json_arrayagg(id) from ps_endpoints where FIND_IN_SET(g.id,call_group) > 0	) as call_group, (select json_arrayagg(id) from ps_endpoints where FIND_IN_SET(g.id,pickup_group) > 0 ) as pickup_group from asterisk.groups as g where g.id=?';

            this.id = (id) ? id : this.id;

            try {
                let row = await db.query(sql,[this.id]);
                if(row.length){
                    this.id = row[0].id;
                    this.name = row[0].name;
                    this.members = {call_group: row[0].call_group, pickup_group: row[0].pickup_group};
                    callback(this);
                }else{
                    callback(false);
                }
            } catch (e) {
                callback(false);
                console.log(e);
            } finally {
                db.close();
            }
        },

        async create(callback, members) {
            let db = Database();

            await this.makeSafe();

            try {
                let row = await db.query("insert into asterisk.groups (name) values (?)", [this.name]);
                this.id = row.insertId;
                this.get((result)=>{
                    callback(this);
                });
            } catch (e) {
                console.log(e.sqlMessage);
                callback(false);
            } finally {
                db.close();
            }
        },

        async update(callback, members) {
            await this.makeSafe();

            let db = Database(),
                sql1 = "update ps_endpoints set context=?,allow=?,callerid=?,named_call_group=?,named_pickup_group=? where id=?",
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
            } catch (e) {
                console.log(e.sqlMessage);
                callback(false);
                db.rollback();
            } finally {
                db.close();
            }
        },

        async delete(callback) {
            let db = Database();

            try {
                await db.beginTransaction();
                await db.query("delete from ps_endpoints where id=?", [this.extension]);
                await db.query("delete from ps_auths where id=?", [this.extension]);
                await db.query("delete from ps_aors where id=?", [this.extension]);
                await db.commit();
                callback(true);
            } catch (e) {
                console.log(e.sqlMessage);
                callback(false);
                db.rollback();
            } finally {
                db.close();
            }
        }
    }
};


Group(null,'CPD')
    .getAll((result)=>{
        if(result){
            console.log(result);
        }else{
            console.log('Não foi possível criar o grupo');
        }
    });
