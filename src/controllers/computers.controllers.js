import { pool } from "../db.js";

const userId_session = 1 //Karl
const centerId_session = 2//srt

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
        const [ rows ] = await pool.query('SELECT *FROM computers WHERE id = ?', [req.params.id])

        if(rows.length <= 0){
            return res.status(400).json({ messaje: 'COMPUTER NOT FOUND' })
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

        const [ result ] = await pool.query('UPDATE computers SET model = IFNULL(?,model), company = IFNULL(?,company),type = IFNULL(?,type), id_center = IFNULL(?,id_center) WHERE id = ? ',[model, company, type, id_center])

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
        let page = parseInt(req.query.page)
        let pageSize = 5

        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;

        const [rows] = await pool.query('SELECT *FROM computers LIMIT ?, ?',[startIndex, pageSize])

        let [ totalCount ] = await pool.query('SELECT COUNT(*) as total FROM computers')

        totalCount = totalCount[0].total

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