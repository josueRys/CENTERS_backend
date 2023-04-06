import { pool } from "../db.js";

const readRows = async (page, pageSize) => {

    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    const [rows] =  await pool.query('SELECT * FROM users LIMIT ?, ?',[startIndex, pageSize])

    let [ totalCount ] = await pool.query('SELECT COUNT(*) as total FROM users')

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
}

export default readRows