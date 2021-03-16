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
                connection.connect(function(err) {
                    if (err) {
                        console.error('error connecting: ' + err.stack);
                        reject(err);
                    }
                    else {
                        console.log('connected as id ' + connection.threadId);
                        Restgoose.setConnector(new RestgooseSqlConnector(connection));
                        connected = true;
                        
                        //Creating tables for the tests
                        //language=mysql
                        connection.query(`
                            CREATE TABLE IF NOT EXISTS ArrayField (
                                id int NOT NULL AUTO_INCREMENT,
                                data TEXT CHARACTER SET utf8 NOT NULL,
                                PRIMARY KEY (id)
                            ) ENGINE=INNODB;
                        `);
                        connection.query(`
                            CREATE TABLE IF NOT EXISTS StringField (
                                id int NOT NULL AUTO_INCREMENT,
                                data TEXT CHARACTER SET utf8 NOT NULL,
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
