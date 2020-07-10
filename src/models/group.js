const Common = require('./Common');
const Database = require('./database');
const Extension = require('./extension');

module.exports = function Group(id, name, call_members=[], pickup_members=[]) {
    return {
        id: id,
        name: name,
        call_members: call_members,
        pickup_members: pickup_members,
        
        //OK
        makeSafe() {
            this.id = (this.id) ? parseInt(this.id) : null;
            this.name = (this.name) ? Common.sanitizeString(this.name.toUpperCase()) : null;
            this.call_members = (this.call_members) ? this.call_members : [];
            this.pickup_members = (this.pickup_members) ? this.pickup_members : [];
        },

        //OK
        async getAll(callback = function(){}) {
            let db = Database(),
                grpList = [];

            try {
                let rows = await db.query('\
                    select\
                        id, g.name,\
                        (select json_arrayagg(id) from ps_endpoints where FIND_IN_SET(g.id,call_group) > 0	) as call_members,\
                        (select json_arrayagg(id) from ps_endpoints where FIND_IN_SET(g.id,pickup_group) > 0 ) as pickup_members\
                    from asterisk.groups as g'
                );

                for (let [idx, row] of rows.entries()) {
                    let grp = Group(row.id, row.name, row.call_members, row.pickup_members);
                    await grp.makeSafe();
                    await grpList.push(grp);
                }
                callback(grpList);
                return grpList;
            } catch (e) {
                console.log(e);
                callback(false);
                return false;
            } finally {
                db.close();
            }
        },

        //OK
        async get(callback = function(){}) {
            let db = Database(),
                sql = 'select\
                            id,\
                            g.name,\
                            (select json_arrayagg(id) from ps_endpoints where FIND_IN_SET(g.id,call_group) > 0	) as call_members,\
                            (select json_arrayagg(id) from ps_endpoints where FIND_IN_SET(g.id,pickup_group) > 0 ) as pickup_members\
                        from asterisk.groups as g where g.id=?';

            try {
                let row = await db.query(sql, [this.id]);
                if (row.length) {
                    this.id = row[0].id;
                    this.name = row[0].name;
                    this.call_members = row[0].call_members;
                    this.pickup_members = row[0].pickup_members;
                    this.makeSafe();
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

        async getAllNoMembers(callback = function(){}){
            let db = Database(),
                grpList = [];

            try {
                let rows = await db.query('select * from asterisk.groups');

                for (let [idx, row] of rows.entries()) {
                    await grpList.push({id: row.id, name: row.name});
                }
                callback(grpList);
                return grpList;
            } catch (e) {
                console.log(e);
                callback(false);
                return false;
            } finally {
                db.close();
            }
        },

        //OK
        async create(callback = function(){}) {
            let db = Database();
            await this.makeSafe();
            try {
                db.beginTransaction();
                let row = await db.query("insert into asterisk.groups (id, name) values (?,?)", [this.id, this.name]);
                this.id = row.insertId;

                for (let [idx, exten] of this.call_members.entries()) {
                    //console.log(`Add ${exten} ao call_group ${this.name}`);
                    await db.query("\
                            update asterisk.ps_endpoints\
                                set call_group =\
                                    case\
                                        when LENGTH(call_group) > 0 then concat(call_group,',?')\
                                        else ?\
                                    end\
                            where id = ? and (find_in_set('?',call_group) < 1 or find_in_set('?',call_group) is null);",
                        [this.id, this.id, exten, this.id, this.id]
                    );
                }

                for (let [idx, exten] of this.pickup_members.entries()) {
                    //console.log(`Add ${exten} ao pickup_group ${this.name}`);
                    await db.query("\
                            update asterisk.ps_endpoints\
                                set pickup_group =\
                                    case\
                                        when LENGTH(pickup_group) > 0 then concat(pickup_group,',?')\
                                        else ?\
                                    end\
                            where id = ? and (find_in_set('?',pickup_group) < 1 or find_in_set('?',pickup_group) is null);",
                        [this.id, this.id, exten, this.id, this.id]
                    );
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

        //OK
        async update(callback = function(){}) {
            let oldGroup = await Group(this.id).get();

            if (oldGroup) {
                if (await oldGroup.delete()){
                    await this.makeSafe();
                    if(await this.create()){
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
            } else {
                callback(false);
                return (false);
            }
        },

        //OK
        async delete(callback = function(){}) {
            this.makeSafe();
            let db = Database(),
                sql1 = "UPDATE asterisk.ps_endpoints \
                SET \
                   call_group = \
                    TRIM(BOTH ',' FROM \
                      REPLACE\(\
                        REPLACE(CONCAT(',',REPLACE(call_group, ',', ',,'), ','),',?,', ''), ',,', ',')\
                    ), \
                    pickup_group = \
                    TRIM(BOTH ',' FROM \
                      REPLACE( \
                        REPLACE(CONCAT(',',REPLACE(pickup_group, ',', ',,'), ','),',?,', ''), ',,', ',')\
                    ) \
                WHERE \
                  FIND_IN_SET(?, call_group) or FIND_IN_SET(?, pickup_group);",
                sql2 = "delete from asterisk.groups where id=?";

            try {
                await db.beginTransaction();
                await db.query(sql1, [this.id, this.id, this.id, this.id]);
                await db.query(sql2, [this.id]);
                await db.commit();
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
