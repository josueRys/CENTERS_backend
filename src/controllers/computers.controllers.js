import { pool } from "../db.js";
import session from "express-session"

// CRUD

export const createComputer = async (req, res) => {
    try {
        const { model, company, type, id_center } = req.body
        
        if(!model || !company || !type || !id_center){
            return res.status(500).json({ messaje: 'DATA IS NEEDED' })
        }

        const [ rows ] = await pool.query('INSERT INTO computers(model, company, type, id_center) values(?,?,?,?) ', [model, company, type, id_center])
        
        res.json({
            id: rows.insertId,
            model,
            company,
            type,
            id_center
        })

    } catch (error) {
        return res.status(500).json({ messaje: 'SOMETHING WENT WRONG' })
    }
}

export const readComputer = async (req, res) => {
    try {
        const sqlA = `
            SELECT cmp.*
            FROM computers cmp
            JOIN centers c ON cmp.id_center = c.id
            JOIN users_centers uc ON uc.id_center = c.id
            WHERE uc.id_user = ${ session.userId }
            AND uc.rol = 'admin'
            AND cmp.id = ${req.params.id} 
        `;

        const sqlR = `
            SELECT cmp.*
            FROM computers cmp
            WHERE cmp.id = ${req.params.id}
        `;

        let sql = sqlA

        if(session.root === true){
            sql = sqlR
        }

        const [rows] = await pool.query(sql)

        if (rows.length <= 0){
            return res.status(404).json({ messaje: 'COMPUTER NOT FOUND' })
        }

        res.json(rows[0])

    } catch (error) {
        return res.status(500).json({ messaje: 'SOMETHING WENT WRONG' })
    }
}

export const updateComputer = async (req, res) => {
    try {
        const { model, company, type, id_center } = req.body
        const id = req.params.id

        const [ result ] = await pool.query('UPDATE computers SET model = IFNULL(?,model), company = IFNULL(?,company),type = IFNULL(?,type), id_center = IFNULL(?,id_center) WHERE id = ? ',[model, company, type, id_center, id])

        if(result.affectedRows <= 0){
            return res.status(400).json({ messaje: 'COmPUTER NOT FOUND' })
        }

        const [ rows ] = await pool.query('SELECT *FROM computers WHERE id = ?',[id])

        res.json(rows[0])

    } catch (error) {
        return res.status(500).json({ messaje: 'SOMETHING WENT WRONG' })
    }
}

export const deleteComputer = async (req, res) => {
    try {
        const [ rows ] = await pool.query('DELETE FROM computers WHERE id = ?',[req.params.id])

        if(rows.affectedRows <= 0){
            return res.status(400).json({ messaje:'COMPUTER NOT FOUND' })
        }

        res.sendStatus(200)
    } catch (error) {
        return res.status(500).json({ messaje: 'SOMETHING WENT WRONG' })
    }
}

export const readComputers = async (req, res) => {
    try {

        const sqlARs = `
                SELECT cmp.id, cmp.model
                FROM computers cmp
                WHERE id_center = ? ORDER BY id DESC
        `;

        if(req.query.idCenter){
            const idCenter = parseInt(req.query.idCenter)
            const [rows] = await pool.query(sqlARs,[ idCenter ])
            return res.status(200).json(rows)
        }

        let page = parseInt(req.query.page)
        let pageSize = 10

        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;

        const sqlA = `
                SELECT cmp.id, cmp.model, cmp.company, cmp.type
                FROM computers cmp
                JOIN centers c ON cmp.id_center = c.id
                WHERE c.id IN (
                    SELECT uc.id_center
                    FROM users_centers uc
                    WHERE uc.id_user = ${ session.userId } AND uc.rol = 'admin'
                ) ORDER BY id DESC LIMIT ${startIndex}, ${pageSize}
        `;

        const sqlA2 = `
                SELECT COUNT(cmp.id)
                FROM computers cmp
                JOIN centers c ON cmp.id_center = c.id
                WHERE c.id IN (
                    SELECT uc.id_center
                    FROM users_centers uc
                    WHERE uc.id_user = ${ session.userId } AND uc.rol = 'admin'
                )
        `;

        const sqlR = `
                SELECT cmp.id, cmp.model, cmp.company, cmp.type
                FROM computers cmp
                ORDER BY id DESC LIMIT ${startIndex}, ${pageSize}
        `;

        const sqlR2 = `
                SELECT COUNT(cmp.id) as totalCount
                FROM computers cmp
        `;

        let sql = sqlA
        let sql2 = sqlA2

        if (session.root === true){
            sql = sqlR
            sql2 = sqlR2
        }
        
        const [rows] = await pool.query(sql)

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