import { findUser } from "../database/checkUser.js";
import session from "express-session";
import { pool } from "../db.js";

/* let user = {
    id: null,
    name: 'user1',
    surnames: 'lastname',
    phone_number: null
} */


// CRUD

export const createCenter = async (req, res) => {
    try {
        const { name,coordinate, address, phone_number } = req.body
        
        if(!name || !coordinate || !address || !phone_number){
            return res.status(500).json({ messaje: 'DATA IS NEEDED' })
        }

        await pool.query('INSERT INTO centers(name,coordinate, address, phone_number) values(?,?,?,?) ', [name,coordinate, address, phone_number])

        res.sendStatus(200)

    } catch (error) {
        return res.status(500).json({ messaje: 'SOMETHING WENT WRONG' })
    }
}

export const readCenter = async (req, res) => {
    try {
        const sqlA = `
            SELECT c.*
            FROM centers c
            JOIN users_centers uc ON c.id = uc.id_center
            WHERE uc.id_user = ${ session.userId } AND uc.rol = 'admin' AND c.id = ${req.params.id}
        `;

        const sqlR = `
            SELECT c.*
            FROM centers c
            WHERE c.id = ${req.params.id}
        `;

        let sql = sqlA

        if(session.root === true){
            sql = sqlR
        }

        const [ rows ] = await pool.query(sql)

        if(rows.length <= 0){
            return res.status(404).json({ messaje: 'CENTER NOT FOUND' })
        }

        res.json(rows[0])

    } catch (error) {
        return res.status(500).json({ messaje: 'SOMETHING WENT WRONG' })
    }
}

export const updateCenter = async (req, res) => {
    try {
        const { name,coordinate, address, phone_number } = req.body
        const id = req.params.id

        const [ result ] = await pool.query('UPDATE centers SET name = IFNULL(?,name), coordinate = IFNULL(?,coordinate),address = IFNULL(?,address), phone_number = IFNULL(?,phone_number) WHERE id = ? ',[name,coordinate, address, phone_number, id])

        if(result.affectedRows <= 0){
            return res.status(400).json({ messaje: 'CENTER NOT FOUND' })
        }

        res.sendStatus(200)

    } catch (error) {
        return res.status(500).json({ messaje: 'SOMETHING WENT WRONG' })
    }
}

export const deleteCenter = async (req, res) => {
    try {
        const [ rows ] = await pool.query('DELETE FROM centers WHERE id = ?',[req.params.id])

        if(rows.affectedRows <= 0){
            return res.status(400).json({ messaje:'CENTER NOT FOUND' })
        }

        res.sendStatus(200)
    } catch (error) {
        return res.status(500).json({ messaje: 'SOMETHING WENT WRONG' })
    }
}

export const readCenters = async (req, res) => {
    try {
        let page = parseInt(req.query.page)
        let pageSize = 10

        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;

        // consulta para admin y client

        const sqlAC = `
                SELECT c.*
                FROM centers c
                JOIN users_centers uc ON c.id = uc.id_center
                WHERE uc.id_user = ${ session.userId } ORDER BY id DESC LIMIT ${startIndex}, ${pageSize}
        `;

        const sql2AC = `
                SELECT COUNT(c.id) as totalCount
                FROM centers c
                JOIN users_centers uc ON c.id = uc.id_center
                WHERE uc.id_user = ${ session.userId }
        `;

        // consulta para root

        const sqlR = `
                SELECT c.*
                FROM centers c
                ORDER BY id DESC LIMIT ${startIndex}, ${pageSize}
        `;

        const sql2R = `
                SELECT COUNT(c.id) as totalCount
                FROM centers c                
        `;


        let sql = sqlAC
        let sql2 = sql2AC

        if (session.root === true){
            sql = sqlR
            sql2 = sql2R
        }

        const [ rows ] = await pool.query(sql)
        if(rows.length <= 0){
            return res.sendStatus(404)
        }

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