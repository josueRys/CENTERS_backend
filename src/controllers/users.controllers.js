import { findUser } from "../database/checkUser.js"
import { pool } from "../db.js"
import session from "express-session"
    // CRUD

export const login = async ( req, res ) => {
    try {

        const { username, password } = req.body
        const [ rows ] = await pool.query('SELECT id, username, status FROM users WHERE username = ? AND password = ? ',[username,password])

        if (rows.length > 0){
            const sessionId = rows[0].id

            res.cookie('sessionId',sessionId,{
                httpOnly: true,
                maxAge: 86400000
            })
            res.status(200).json({ data: rows })
        }

    } catch (error) {
        return res.status(500).json({ messaje: 'SOMETHING WENT WRONG' })
    }
}

export const logout = async ( req, res ) => {
    try {
        res.clearCookie('sessionId')
        res.sendStatus(200)
    } catch (error) {
        return res.status(500).json({ messaje: 'SOMETHING WENT WRONG' })
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

    const sessionId = parseInt(req.cookies.sessionId)

    try {
        const sqlA = `
            SELECT u.*
            FROM users u
            JOIN users_centers uc ON u.id = uc.id_user
            WHERE uc.id_center IN (
            SELECT uc2.id_center
            FROM users_centers uc2
            WHERE uc2.id_user = ${ sessionId } AND uc2.rol = 'admin'
            ) AND u.id = ${req.params.id}
        `;

        const sqlR = `
            SELECT u.*
            FROM users u
            WHERE u.id = ${req.params.id}
        `;

        let sql = sqlA

        if(sessionId === 41){
            sql = sqlR
        }

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

    const sessionId = parseInt(req.cookies.sessionId)

    try {

        // 'idCenter' sin 'page'
        const sqlARs = `
                SELECT u.id, u.username, u.status
                FROM users u
                JOIN users_centers uc ON u.id = uc.id_user
                WHERE uc.id_center = ? ORDER BY id DESC
        `;

        if(req.query.idCenter && !req.query.page ){
            const idCenter = parseInt(req.query.idCenter)
            const [rows]  = await pool.query(sqlARs,[idCenter])
            return res.status(200).json(rows)
        }

        const page = parseInt(req.query.page)
        const idCenter = parseInt(req.query.idCenter)
        
        let pageSize = 10

        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;

        let consulta = ''
        let consulta2 = ''        
        
        if ( req.query.page && req.query.idCenter ){        // 'idCenter' con 'page'
            consulta = `AND uc.id_center = ${idCenter}`;
            if (sessionId === 41){
                consulta = `AND uc.id_center = ${idCenter}`;
                consulta2 = `JOIN users_centers uc ON u.id = uc.id_user`
            }
        }       

        const sqlA = `
                SELECT DISTINCT u.id, u.username, u.password, u.phone_number
                FROM users u
                JOIN users_centers uc ON u.id = uc.id_user
                WHERE uc.id_center IN (
                SELECT uc2.id_center
                FROM users_centers uc2
                WHERE uc2.id_user = ${sessionId } AND uc2.rol = 'admin'
                ) AND NOT u.id = ${sessionId } ${consulta} ORDER BY id DESC LIMIT ${startIndex}, ${pageSize}
        `;

        const sql2A = `
                SELECT COUNT(DISTINCT u.id) as totalCount
                FROM users u
                JOIN users_centers uc ON u.id = uc.id_user
                WHERE uc.id_center IN (
                SELECT uc2.id_center
                FROM users_centers uc2
                WHERE uc2.id_user = ${sessionId } AND uc2.rol = 'admin'
                ) AND NOT u.id = ${sessionId} ${consulta}
        `;

        const sqlR = `
                SELECT DISTINCT u.id, u.username, u.password, u.phone_number
                FROM users u
                ${consulta2}
                WHERE NOT u.id = ${sessionId} ${consulta}
                ORDER BY id DESC LIMIT ${startIndex}, ${pageSize}
        `;

        const sql2R = `
                SELECT COUNT(DISTINCT u.id) as totalCount
                FROM users u 
                ${consulta2}
                WHERE NOT u.id = ${sessionId} ${consulta}
        `;

        let sql = sqlA
        let sql2 = sql2A

        if (sessionId === 41){
            sql = sqlR
            sql2 = sql2R
        }

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
            return res.sendStatus(204)
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