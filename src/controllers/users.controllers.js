import { findUser } from "../database/checkUser.js"
import { pool } from "../db.js"
import session from "express-session"

/* let user = {
    id: null,
    name: 'user1',
    surnames: 'lastname',
    phone_number: null
} */
    // CRUD

export const login = async ( req, res ) => {
    try {
        const { username, password } = req.body
        const data = await findUser(username, password)

        if ( data === false ){
            return res.status(404).json({ messaje: 'USER NOT FOUND' })
        } else {
            session.userId = data.id
            session.root = false
            if(data.username == 'Josue' && data.password == 'rysrvr'){
                session.root = true
            }
        }
        res.sendStatus(200)
    } catch (error) {
        res.status(404).json({ messaje: 'USER NOT FOUND' })
    }
}

export const createUser = async (req, res) => {
    
    try {
        const { username, password, phone_number } = req.body

        if(!username || !password || !phone_number){
            return res.status(500).json({ messaje: 'DATA IS NEEDED' })
        }

        await pool.query('INSERT INTO users(username, password, phone_number) VALUES( ?, ?, ?)',[username,password,phone_number])
        
        res.sendStatus(200)


    } catch (error) {
        return res.status(500).json({ messaje: 'SOMETHING WENT WRONG' })
    }
}

export const readUser = async (req, res) => {
    try {
        const sql = `
            SELECT u.*
            FROM users u
            JOIN users_centers uc ON u.id = uc.id_user
            WHERE uc.id_center IN (
            SELECT uc2.id_center
            FROM users_centers uc2
            WHERE uc2.id_user = ${ session.userId } AND uc2.rol = 'admin'
            ) AND u.id = ${req.params.id}
        `;
        const [rows] = await pool.query(sql)

        if (rows.length <= 0){
            return res.status(404).json({ messaje: 'USER NOT FOUND' })
        }

        res.json(rows[0])

    } catch (error) {
        return res.status(500).json({ messaje: 'SOMETHING WENT WRONG' })
    }
}

export const updateUser = async (req, res) => {
    try {
        const id = req.params.id
        const { username, password, phone_number } = req.body

        const [result] = await pool.query('UPDATE users SET username = IFNULL(?, username), password = IFNULL(?, password), phone_number = IFNULL(?, phone_number) WHERE id = ?', [username, password, phone_number, id])

        if(result.affectedRows === 0){
            return res.status(404).json({ messaje: 'USER NOT FOUND' })
        }

        res.sendStatus(200)

    } catch (error) {
        return res.status(500).json({ messaje: 'SOMETHING WENT WRONG' })
    }
}

export const deleteUser = async (req, res) => {
    try {
        const [ rows ] = await pool.query('DELETE FROM users WHERE id = ?', [req.params.id])

        if(rows.affectedRows <= 0){
            return res.status(404).json({ messaje: 'USER NOT FOUND' })
        }

        res.sendStatus(200)

    } catch (error) {
        return res.status(500).json({ messaje: 'SOMETHING WENT WRONG' })
    }
}

export const readUsers =  async (req, res) => {
    try {
        const page = parseInt(req.query.page)
        const pageSize = 3

        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;

        const sql = `
                SELECT DISTINCT u.*
                FROM users u
                JOIN users_centers uc ON u.id = uc.id_user
                WHERE uc.id_center IN (
                SELECT uc2.id_center
                FROM users_centers uc2
                WHERE uc2.id_user = ${ session.userId } AND uc2.rol = 'admin'
                ) ORDER BY username DESC LIMIT ${startIndex}, ${pageSize}
        `;

        const sql2 = `
                SELECT COUNT(DISTINCT u.id) as totalCount
                FROM users u
                JOIN users_centers uc ON u.id = uc.id_user
                WHERE uc.id_center IN (
                SELECT uc2.id_center
                FROM users_centers uc2
                WHERE uc2.id_user = ${session.userId } AND uc2.rol = 'admin'
                )
        `;

        let [ totalCount ] = await pool.query(sql2)

        totalCount = totalCount[0].totalCount

        const [rows] =  await pool.query(sql)

        let prevPage = null;
        if (startIndex > 0) {
            prevPage = {
                page: page - 1,
                pageSize: pageSize
            };
        }

        let nextPage = null;
        if (endIndex < totalCount) {
            nextPage = {
                page: page + 1,
                pageSize: (totalCount - endIndex  < pageSize) ? totalCount - endIndex : pageSize
            };
        }

        if(rows.length <= 0){
            return res.status(400).json({ messaje: 'NO DATA' })
        }

        res.json({
            prevPage: prevPage,
            nextPage: nextPage,
            totalCount: totalCount,
            data: rows,
          });
                
    } catch (error) {
        return res.status(500).json({ messaje : 'SOMETHING WENT WRONG' })
    }
}