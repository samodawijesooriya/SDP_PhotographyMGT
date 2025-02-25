// models/userModel.js
import db from '../config/db.js';

class UserModel {
    static getAllUsers(result) {
        db.query('SELECT userID, username, email, role, mobile FROM user', (err, res) => {
            if (err) {
                console.log('Error:', err);
                result(err, null);
                return;
            }
            result(null, res);
        });
    }

    static getUserById(id, result) {
        db.query('SELECT userID, username, email, role, mobile FROM user WHERE userID = ?', [id], (err, res) => {
            if (err) {
                console.log('Error:', err);
                result(err, null);
                return;
            }
            if (res.length) {
                result(null, res[0]);
                return;
            }
            result({ kind: "not_found" }, null);
        });
    }


    static updateUser(id, user, result) {
        db.query(
            'UPDATE user SET username = ?, email = ?, role = ?, mobile = ? WHERE userID = ?',
            [user.username, user.email, user.role, user.mobile, id],
            (err, res) => {
                if (err) {
                    console.log('Error:', err);
                    result(err, null);
                    return;
                }
                if (res.affectedRows == 0) {
                    result({ kind: "not_found" }, null);
                    return;
                }
                result(null, { id: id, ...user });
            }
        );
    }

    static deleteUser(id, result) {
        db.query('DELETE FROM user WHERE userID = ?', id, (err, res) => {
            if (err) {
                console.log('Error:', err);
                result(err, null);
                return;
            }
            if (res.affectedRows == 0) {
                result({ kind: "not_found" }, null);
                return;
            }
            result(null, res);
        });
    }
}

export default UserModel;