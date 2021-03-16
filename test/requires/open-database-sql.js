const mysql = require('../../../restgoose-sql-connector/node_modules/mysql');
const Restgoose = require('../../lib').Restgoose;
const RestgooseSqlConnector = require('../../../restgoose-sql-connector/lib/index').RestgooseSqlConnector;

const connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'password',
    database : 'restgoose',
});
let connected = false;

global.openDatabase = function() {
    return new Promise((resolve, reject) => {
        try {
            if (connected) {
                resolve();
            }
            else {
                connection.connect(async function(err) {
                    if (err) {
                        console.error('error connecting: ' + err.stack);
                        reject(err);
                    }
                    else {
                        console.log('connected as id ' + connection.threadId);
                        Restgoose.setConnector(new RestgooseSqlConnector(connection));
                        connected = true;
                        
                        //Creating tables for the tests
                        const query = (queryString) => {
                            return new Promise((resolve, reject) => {
                                connection.query(queryString, function (error, results) {
                                    if (error) {
                                        reject(error);
                                    }
                                    else {
                                        resolve(results);
                                    }
                                });
                            });
                        };
                        
                        //TODO Find a way to automate this process. This is not going to scale well
                        //language=mysql
                        await query(`
                            CREATE TABLE IF NOT EXISTS ArrayField (
                                id int NOT NULL AUTO_INCREMENT,
                                data TEXT CHARACTER SET utf8 NOT NULL,
                                PRIMARY KEY (id)
                            ) ENGINE=INNODB;
                        `);
                        await query(`
                            CREATE TABLE IF NOT EXISTS EnumField (
                                id int NOT NULL AUTO_INCREMENT,
                                title TEXT CHARACTER SET utf8 NOT NULL,
                                title2 ENUM('a', 'b', 'c') CHARACTER SET utf8 NOT NULL,
                                PRIMARY KEY (id)
                            ) ENGINE=INNODB;
                        `);
                        await query(`
                            CREATE TABLE IF NOT EXISTS ObjectField (
                                id int NOT NULL AUTO_INCREMENT,
                                data TEXT CHARACTER SET utf8 NULL,
                                PRIMARY KEY (id)
                            ) ENGINE=INNODB;
                        `);
                        await query(`
                            CREATE TABLE IF NOT EXISTS RestgooseField (
                                id int NOT NULL AUTO_INCREMENT,
                                data TEXT CHARACTER SET utf8 NULL,
                                PRIMARY KEY (id)
                            ) ENGINE=INNODB;
                        `);
                        await query(`
                            CREATE TABLE IF NOT EXISTS StringField (
                                id int NOT NULL AUTO_INCREMENT,
                                data TEXT CHARACTER SET utf8 NOT NULL,
                                PRIMARY KEY (id)
                            ) ENGINE=INNODB;
                        `);
                        await query(`
                            CREATE TABLE IF NOT EXISTS SubmodelEmbedded (
                                id int NOT NULL AUTO_INCREMENT,
                                title TEXT CHARACTER SET utf8 NULL,
                                subints TEXT CHARACTER SET utf8 NULL,
                                subitems TEXT CHARACTER SET utf8 NULL,
                                uniqueSubitem TEXT CHARACTER SET utf8 NULL,
                                trickysubitems TEXT CHARACTER SET utf8 NULL,
                                PRIMARY KEY (id)
                            ) ENGINE=INNODB;
                        `);
                        await query(`
                            CREATE TABLE IF NOT EXISTS SubmodelReferenced (
                                id int NOT NULL AUTO_INCREMENT,
                                title TEXT CHARACTER SET utf8 NOT NULL,
                                PRIMARY KEY (id)
                            ) ENGINE=INNODB;
                        `);
                        await query(`
                            CREATE TABLE IF NOT EXISTS SubItemReferenced (
                                id int NOT NULL AUTO_INCREMENT,
                                SubmodelReferenced_id int NOT NULL,
                                name TEXT CHARACTER SET utf8 NOT NULL,
                                value INT NOT NULL,
                                PRIMARY KEY (id)
                            ) ENGINE=INNODB;
                        `);
                        await query(`
                            CREATE TABLE IF NOT EXISTS Todo (
                                id int NOT NULL AUTO_INCREMENT,
                                title TEXT CHARACTER SET utf8 NOT NULL,
                                PRIMARY KEY (id)
                            ) ENGINE=INNODB;
                        `);
                        await query(`
                            CREATE TABLE IF NOT EXISTS ExtendedModel (
                                id int NOT NULL AUTO_INCREMENT,
                                title TEXT CHARACTER SET utf8 NOT NULL,
                                PRIMARY KEY (id)
                            ) ENGINE=INNODB;
                        `);
                        
                        resolve();
                    }
                });
            }
        }
        catch (e) {
            reject(e);
        }
    });
}
