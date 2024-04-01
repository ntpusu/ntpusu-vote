import prisma from '~/lib/prisma'
import { getServerSession } from '#auth'
//import { createRequire } from 'module';
//const require = createRequire(import.meta.url);
//const fs = require("fs");
import * as XLSX from 'xlsx';
//import * as fs from 'fs'
//var XLSX = require("xlsx");
//XLSX.set_fs(fs);
export default defineEventHandler(async (event) => {
    const session = await getServerSession(event) as { user: { email: string } } | null
    //const formData = await readBody(event) as string
    const formData = (await readMultipartFormData(event))!// as MultiPartData[]
    let fileName = formData[0].data.toString("utf8") as string
    let file = formData[1].data
    //const formData = await readFormData(event)

    if (!session) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized',
            message: '未登入',
        })
    }

    const email = session.user.email
    const studentId = parseInt(email.substring(1, 10))

    const admin = await prisma.admin.findUnique({
        where: { id: studentId },
        select: null,
    })

    if (!admin) {
        throw createError({
            statusCode: 403,
            statusMessage: 'Forbidden',
            message: '不在管理員名單中',
        })
    }
    //let localFilePath = '/tmp/voterData' + Date.now() + ".xlsx";
    
    //const buffer = Buffer.from(fileHex, 'hex');

    //await fs.writeFileSync(localFilePath, file, () => console.log('xlsx saved!'));
    let group_workbook = XLSX.read(file)
    let name = group_workbook.SheetNames[0]
    let group_sheet = group_workbook.Sheets[group_workbook.SheetNames[0]]
    const group_table : any[][] = XLSX.utils.sheet_to_json(group_sheet, { header: 1 })
    
    const data = []
    for (let i = 1; i < group_table.length; i++) {
        const Group_Name = group_table[i][0] as string
        const Group = group_table[i].slice(1,4) as string[]

        data.push({ Group_Name}) 
    }

    await prisma.group.createMany({
        data: [
            {
                name: "Group_Name",
            },
        ],
        // where: {
        //     id: i,
        //     name: Group_Name,
        // },
        // update: {},
        // create: {
        //     name: Group_Name,
        // },
    })
    await prisma

    return await {}
})