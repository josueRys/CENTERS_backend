import moment from "moment/moment.js";
import session from "express-session";
import { pool } from "../db.js"

// CRUD

export const createRegister = async (req, res) => {
    try {
        const date = moment().format("DD/MM/YYYY")
        const start_time = moment().format('h:mm:ss A')
        const { id_computer, id_user, id_center } = req.body
        
        if (!date || !start_time || !id_computer || !id_user || !id_center){
            return res.status(500).json({ messaje: 'DATA IS NEEDED' })
        }
    
        await pool.query('INSERT INTO registers(date, start_time, id_computer, id_user, id_center) VALUES(?, ?, ?, ?, ?)',[date, start_time, id_computer, id_user, id_center])
    
        res.sendStatus(200)

    } catch (error) {
        return res.status(500).json({ messaje: 'SOMETHING WENT WRONG' })
    }
}

export const readRegister = async (req, res) => {
    try {
        const [ rows ] = await pool.query('SELECT *FROM registers WHERE id = ?', req.params.id)

        if(rows.length <= 0){
            return res.status(400).json({ messaje:'REGISTER NOT FOUND' })
        }

        res.json(rows[0])
    } catch (error) {
        return res.status(500).json({ messaje: 'SOMETHING WENT WRONG' })
    }
}

export const updateRegister = async (req, res) => {
    try {
        const { date, start_time, id_computer, id_user, id_center } = req.body
        const leave_time = moment().format('h:mm:ss A')
        const id = req.params.id

        const [ result ] = await pool.query('UPDATE registers SET date = IFNULL(?, date), start_time = IFNULL(?, start_time), leave_time = IFNULL(?, leave_time),id_computer = IFNULL(?, id_computer),id_user = IFNULL(?, id_user),id_center = IFNULL(?, id_center) WHERE id = ?',[date, start_time, leave_time, id_computer, id_user, id_center, id])

        if(result.affectedRows <= 0){
            return res.status(400).json({ messaje: 'REGISTER NOT FOUND' })
        }

        res.sendStatus(200)

    } catch (error) {
        return res.status(500).json({ messaje: 'SOMETHING WENT WRONG' })
    }
}

export const deleteRegister = async (req, res) => {
    try {
        const [ rows ] = await pool.query('DELETE FROM registers WHERE id = ?', req.params.id)

        if(rows.affectedRows <= 0){
            return res.status(400).json({ messaje: 'REGISTER NOT FOUND' })
        }

        res.sendStatus(200)

    } catch (error) {
        return res.status(500).json({ messaje: 'SOMETHING WENT WRONG' })
    }
}

export const readRegisters = async (req, res) => {
    try {            
        let page = parseInt(req.query.page)
        let pageSize = 10

        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;

        const sqlAC = `
                SELECT DISTINCT r.id, r.date, r.start_time, r.leave_time, cmp.model as computer, u.username, c.name as center
                FROM registers r
                JOIN computers cmp ON r.id_computer = cmp.id
                JOIN centers c ON r.id_center = c.id
                JOIN users u ON r.id_user = u.id
                JOIN users_centers uc ON r.id_center = uc.id_center
                WHERE u.id = ${session.userId}
                OR (uc.rol = 'admin' AND uc.id_user = ${session.userId} )
                ORDER BY id DESC LIMIT ${startIndex}, ${pageSize}
        `;

        const sqlAC2 = `
                SELECT COUNT(DISTINCT r.id) AS totalCount
                FROM registers r
                JOIN computers cmp ON r.id_computer = cmp.id
                JOIN centers c ON r.id_center = c.id
                JOIN users u ON r.id_user = u.id
                JOIN users_centers uc ON r.id_center = uc.id_center
                WHERE u.id = ${session.userId}
                OR (uc.rol = 'admin' AND uc.id_user = ${session.userId} )
        `;

        const sqlR = `
                SELECT r.id, r.date, r.start_time, r.leave_time, cmp.model as computer, u.username, c.name as center
                FROM registers r
                JOIN computers cmp ON r.id_computer = cmp.id
                JOIN centers c ON r.id_center = c.id
                JOIN users u ON r.id_user = u.id
                ORDER BY id DESC LIMIT ${startIndex}, ${pageSize}
        `;

        const sqlR2 = `
                SELECT COUNT(r.id) AS totalCount
                FROM registers r
                JOIN computers cmp ON r.id_computer = cmp.id
                JOIN centers c ON r.id_center = c.id
                JOIN users u ON r.id_user = u.id
        `;

        let sql = sqlAC
        let sql2 = sqlAC2

        if(session.root === true){
            sql = sqlR
            sql2 = sqlR2
        }

        
        const [ rows ] = await pool.query(sql)

        
        let [ totalCount ] = await pool.query(sql2)

        totalCount = totalCount[0].totalCount

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
            nextPage: nextPage,
            prevPage: prevPage,
            totalCount: totalCount,
            data: rows,
          });

    } catch (error) {
        return res.status(500).json({ messaje: 'SOMETHING WENT WRONG' })
    }
}