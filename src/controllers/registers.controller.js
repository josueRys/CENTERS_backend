import { pool } from "../db.js"

// CRUD

export const createRegister = async (req, res) => {
    try {
        const { date, start_time, leave_time, id_computer, id_user, id_center } = req.body
        
        if (!date || !start_time || !leave_time || !id_computer || !id_user || !id_center){
            return res.status(500).json({ messaje: 'DATA IS NEEDED' })
        }
    
        await pool.query('INSERT INTO registers(date, start_time, leave_time, id_computer, id_user, id_center) VALUES(?, ?, ?, ?, ?, ?)',[date, start_time, leave_time, id_computer, id_user, id_center])
    
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
        const { date, start_time, leave_time, id_computer, id_user, id_center } = req.body
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
        let pageSize = 5

        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        
        const [ rows ] = await pool.query('SELECT *FROM registers LIMIT ?, ?',[startIndex, pageSize])
        
        let [ totalCount ] = await pool.query('SELECT COUNT(*) as total FROM registers')

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