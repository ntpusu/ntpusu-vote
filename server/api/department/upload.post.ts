import prisma from '~/lib/prisma'
import * as XLSX from 'xlsx';
export default defineEventHandler(async (event) => {
    // 確認權限
    if (!event.context.session) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized',
            message: '未登入',
        })
    }

    if (!event.context.isAdmin) {
        throw createError({
            statusCode: 403,
            statusMessage: 'Forbidden',
            message: '不是管理員',
        })
    }

    // 解析上傳檔案
    const formData = (await readMultipartFormData(event))!
    const file = formData[1].data

    const group_workbook = XLSX.read(file)
    const group_sheet = group_workbook.Sheets[group_workbook.SheetNames[0]]
    const group_table: string[][] = XLSX.utils.sheet_to_json(group_sheet, { header: 1 })

    let allGroups: string[] = []

    for (let i = 1; i < group_table.length; i++) {
        for (let j = 1; j < 4; j++) {
            if (group_table[i][j] !== undefined && group_table[i][j].trim() !== "") {
                allGroups.push(group_table[i][j])
            }
        }
    }

    allGroups = Array.from(new Set(allGroups))

    // 建立群組資料
    await prisma.group.createMany({
        data: allGroups.map((group) => ({ name: group }))
    })

    // 逐筆寫入 department 與對應 group 關聯
    for (let i = 1; i < group_table.length; i++) {
        if (group_table[i][0] === undefined || group_table[i][0].trim() === "") continue

        const department = group_table[i][0].trim()
        const groups = []
        for (let j = 1; j < 4; j++) {
            if (group_table[i][j] !== undefined && group_table[i][j].trim() !== "") {
                groups.push(group_table[i][j].trim())
            }
        }

        // 單筆建立 department 與關聯
        try {
            await prisma.department.create({
                data: {
                    name: department,
                    departmentInGroup: {
                        create: groups.map((group) => ({
                            group: {
                                connect: { name: group }
                            }
                        }))
                    }
                }
            })
        } catch (err) {
            setResponseStatus(event, 500)
            return err
            console.error(`建立 department '${department}' 時發生錯誤：`, err)
        }
    }

    setResponseStatus(event, 204)
    return null
})
