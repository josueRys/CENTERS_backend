import { pool } from "../db.js";

export const findUser = async (username, password) => {
    try {
        const [ rows ] = await pool.query('SELECT * FROM users WHERE username = ? AND password = ? ',[username,password])
        return rows.length > 0 ? rows[0] : false

    } catch (error) {
        return error
    }
}

export const userRol = async (id) => {
    try {
        const [ rows ] = await pool.query('SELECT *FROM users_centers WHERE id_user = ?',[id])
        return rows.length > 0 ? rows : false        
    } catch (error) {
        return error
    }
}