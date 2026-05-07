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
    const formData = await readMultipartFormData(event)
    const file = formData?.[1]?.data
    if (!file) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Bad Request',
            message: '未上傳系所檔案',
        })
    }

    const group_workbook = XLSX.read(file)
    const groupSheetName = group_workbook.SheetNames[0]
    const group_sheet = groupSheetName ? group_workbook.Sheets[groupSheetName] : undefined
    if (!group_sheet) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Bad Request',
            message: '系所檔案沒有可讀取的工作表',
        })
    }

    const group_table: string[][] = XLSX.utils.sheet_to_json(group_sheet, { header: 1 })

    let allGroups: string[] = []

    for (let i = 1; i < group_table.length; i++) {
        const row = group_table[i]
        if (!row) continue

        for (let j = 1; j < 4; j++) {
            const group = row[j]
            if (group !== undefined && group.trim() !== "") {
                allGroups.push(group)
            }
        }
    }
    allGroups = Array.from(new Set(allGroups))

    const departmentGroups = new Map<string, string[]>()
    for (let i = 1; i < group_table.length; i++) {
        const row = group_table[i]
        if (!row || row[0] === undefined || row[0].trim() === "") continue

        const department = row[0].trim()
        const groups = []
        for (let j = 1; j < 4; j++) {
            const group = row[j]
            if (group !== undefined && group.trim() !== "") {
                groups.push(group.trim())
            }
        }

        departmentGroups.set(department, groups)
    }
    try {
        await prisma.$transaction(async (tx) => {
            //Create Groups
            if (allGroups.length > 0) {
                await tx.group.createMany({
                    data: allGroups.map((group) => ({ name: group })),
                    skipDuplicates: true,
                })
            }
            //Create Departments
            const departmentNames = Array.from(departmentGroups.keys())
            if (departmentNames.length > 0) {
                await tx.department.createMany({
                    data: departmentNames.map((department) => ({ name: department })),
                    skipDuplicates: true,
                })
            }

            //Make map
            const [groups, departments] = await Promise.all([
                tx.group.findMany({
                    where: { name: { in: allGroups } },
                    select: { id: true, name: true },
                }),
                tx.department.findMany({
                    where: { name: { in: departmentNames } },
                    select: { id: true, name: true },
                }),
            ])
            const groupIds = new Map(groups.map((group) => [group.name, group.id]))
            const departmentIds = new Map(
                departments.map((department) => [department.name, department.id]),
            )

            //逐筆建立 DepartmentInGroup 關聯
            const departmentInGroupInput = departmentNames.flatMap((department) => {
                const departmentId = departmentIds.get(department)
                if (!departmentId) return []

                return (departmentGroups.get(department) ?? []).flatMap((group) => {
                    const groupId = groupIds.get(group)
                    return groupId ? [{ departmentId, groupId }] : []
                })
            })

            //then create many
            if (departmentInGroupInput.length > 0) {
                await tx.departmentInGroup.createMany({
                    data: departmentInGroupInput,
                    skipDuplicates: true,
                })
            }
        })} catch (e) {
            console.error("Error processing department upload:", e)
            throw createError({
                statusCode: 500,
                statusMessage: 'Internal Server Error',
                message: '處理系所檔案時發生錯誤:' + e,
            })
        }

    setResponseStatus(event, 201)
    return "0"
})
