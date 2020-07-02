const Common = require('./Common');
const Database = require('./database');
const Extension = require('./extension');

module.exports = function Group(id, name, call_members, pickup_members) {
    return {
        id: id,
        name: name,
        call_members: call_members,
        pickup_members: pickup_members,

        //OK
        makeSafe() {
            this.name = (this.name) ? Common.sanitizeString(this.name.toUpperCase()) : null;
            this.call_members = (typeof this.call_members === 'object') ? this.call_members : false;
            this.pickup_members = (typeof this.pickup_members === 'object') ? this.pickup_members : false;
        },

        //OK
        async getAll(callback) {
            let db = Database(),
                grpList = [];

            try {
                let rows = await db.query('\
                    select\
                        id, g.name,\
                        (select group_concat(id) from ps_endpoints where FIND_IN_SET(g.id,call_group) > 0	) as call_members,\
                        (select group_concat(id) from ps_endpoints where FIND_IN_SET(g.id,pickup_group) > 0 ) as pickup_members\
                    from asterisk.groups as g'
                );

                rows.forEach((row) => {
                    grpList.push(Group(row.id, row.name, row.call_members, row.pickup_members));
                });
                callback(grpList);
            } catch (e) {
                callback(false);
                console.log(e);
            } finally {
                db.close();
            }
        },

        //OK
        async get(callback) {
            let db = Database(),
                grpList = []
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
                    callback(this);
                } else {
                    callback(false);
                }
            } catch (e) {
                callback(false);
                console.log(e);
            } finally {
                db.close();
            }
        },

        //OK
        async create(callback) {
            let db = Database();

            await this.makeSafe();

            try {
                let row = await db.query("insert into asterisk.groups (name) values (?)", [this.name]);
                this.id = row.insertId;

                var promises;

                if (this.call_members) {
                    promises += this.call_members.map(async (exten, idx) => {
                        db.query("update asterisk.ps_endpoints\
                                set call_group =\
                                    case\
                                        when LENGTH(call_group) > 0 then concat(call_group,',?')\
                                        else ?\
                                    end\
                                where id = ? and (find_in_set('?',call_group) < 1 or find_in_set('?',call_group) is null);",
                            [this.id, this.id, exten, this.id, this.id]);
                    });
                }

                if (this.pickup_members) {
                    promises += this.pickup_members.map(async (exten, idx) => {
                        db.query("update asterisk.ps_endpoints\
                                set pickup_group = \
                                    case\
                                        when LENGTH(pickup_group) > 0 then concat(pickup_group,',?')\
                                        else ?\
                                    end\
                                where id = ? and (find_in_set('?',pickup_group) < 1 or find_in_set('?',pickup_group) is null);",
                            [this.id, this.id, exten, this.id, this.id]);
                    });
                }

                if (promises) {
                    await Promise.all(promises);
                }

                this.get((result) => {
                    callback(this);
                });
            } catch (e) {
                console.log(e.sqlMessage);
                callback(false);
            } finally {
                db.close();
            }
        },

        //AJUSTAR RETORNO, CALL E PICKUP GROUP UNDEFINED
        async update(callback) {
            let oldGroup;

            await Group(this.id).get((result) => {
                oldGroup = result;
            });

            if (oldGroup) {
                oldGroup.delete((result) => {
                    if (result) {
                        this.makeSafe();
                        this.create((result) => {
                            callback(this);
                        });
                    } else {
                        callback(false);
                    }
                });

            } else {
                callback(false);
            }
        },

        //OK
        async delete(callback) {
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
                        REPLACE(CONCAT(',',REPLACE(pickup_group, ',', ',,'), ','),',?,', ''), ',,', ',') \
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