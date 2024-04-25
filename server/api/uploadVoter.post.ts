import prisma from '~/lib/prisma'
import { getServerSession } from '#auth'
import * as XLSX from 'xlsx';

export default defineEventHandler(async (event) => {
    const session = await getServerSession(event) as { user: { email: string } } | null
    const formData = (await readMultipartFormData(event))!
    const file = formData[0].data

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

    const voter_workbook = XLSX.read(file)
    const voter_sheet = voter_workbook.Sheets[voter_workbook.SheetNames[0]]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const voter_table: any[][] = XLSX.utils.sheet_to_json(voter_sheet, { header: 1 })

    const tasks: Promise<void>[] = []
    for(let i = 1; i < voter_table.length; i += 100) {
        tasks.push(task(voter_table.slice(i, min(voter_table.length, i + 100))));
    }

    await Promise.all(tasks)

    return failAddingVoter;
/*
    const tasks = [
        task(voter_table),
        task(voter_table),
        task(voter_table),
        task(voter_table),
        task(voter_table)
    ]

    await Promise.all(tasks)
    
    await task(voter_table)

    for (let i = 1; i < voter_table.length; i++) {
        const studentId = voter_table[i][0] as number
        //const studentName = voter_table[i][1] as string
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
            })
        }
    }
*/
    
})

const min = (a, b) => {
    return a > b ? b : a;
}

const failAddingVoter: {
    id: number,
}[] = [];

async function task(data:any[][]) {
    for (let i = 1; i < data.length; i++) {
        const studentId = data[i][0] as number
        //const studentName = data[i][1] as string
        const studentDepartment = (data[i][2] as string).replace(/\d[AB]?/, "")
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
            })
        }
    }
}