import prisma from '~/lib/prisma'
import { getServerSession } from '#auth'
import * as XLSX from 'xlsx';

export default defineEventHandler(async (event) => {
    const session = await getServerSession(event) as { user: { email: string } } | null
    const formData = (await readMultipartFormData(event))!
    let file = formData[0].data

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


    let voter_workbook = XLSX.read(file)
    let name = voter_workbook.SheetNames[0]
    let voter_sheet = voter_workbook.Sheets[voter_workbook.SheetNames[0]]
    const voter_table: any[][] = XLSX.utils.sheet_to_json(voter_sheet, { header: 1 })
    
    let failAddingVoter: {
        id: number,
        name: string,
        department: string,
    }[] = [];
    
    for (let i = 1; i < voter_table.length; i++) {
        const studentId = voter_table[i][0] as number
        const studentName = voter_table[i][1] as string
        const studentDepartment = (voter_table[i][2] as string).replace(/\d[AB]?/, "")
        const department = await prisma.department.findUnique({
            where: {
                name: studentDepartment,
            },
            select: {
                id: true,
            },
        })
        if (department !== null) {
            await prisma.voter.upsert({
                where: {
                    id: studentId,
                },
                update: {
                    departmentId: department.id,
                },
                create: {
                    id: studentId,
                    departmentId: department.id,
                },
            })
        }
        else {
            failAddingVoter.push({
                id: studentId,
                name: studentName,
                department: studentDepartment,
            })
        }
    }

    return failAddingVoter;
})
