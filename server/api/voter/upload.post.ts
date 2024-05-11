import prisma from '~/lib/prisma'
import type { Prisma } from '@prisma/client';
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

    // 執行操作
    const formData = (await readMultipartFormData(event))!
    const file = formData[0].data
    const voter_workbook = XLSX.read(file)
    const voter_sheet = voter_workbook.Sheets[voter_workbook.SheetNames[0]]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const voter_table: any[][] = XLSX.utils.sheet_to_json(voter_sheet, { header: 1 })

    const departmentMp = new Map<string, number>()
    await prisma.department.findMany({
        select: {
            id: true,
            name: true,
        },
    }).then((departments) => {
        if (!departments) {
            throw createError({
                statusCode: 500,
                statusMessage: 'Internal Server Error',
                message: '系所資料庫錯誤',
            })
        }
        departments.forEach((department) => {
            departmentMp.set(department.name, department.id)
        })
    })

    enum FailReason {
        DuplicateStudentId = 1,
        DepartmentNotExist = 2,
        InvalidStudentId = 3,
    }

    const failAddingVoter: {
        id: number,
        reason: FailReason,
    }[] = []

    const students: Prisma.VoterCreateManyInput[] = [];

    const studentIdSet = new Set<number>()

    for (let i = 1; i < voter_table.length; i++) {
        const studentId = voter_table[i][0] as number
        if (studentIdSet.has(studentId)) {
            failAddingVoter.push({
                id: studentId,
                reason: FailReason.DuplicateStudentId,
            })
            continue;
        }
        else {
            studentIdSet.add(studentId)
        }
        if (isNaN(studentId) || (studentId <= 100000000 || studentId >= 1000000000)) {
            failAddingVoter.push({
                id: studentId,
                reason: FailReason.InvalidStudentId,
            })
            continue;
        }
        const studentDepartment = (voter_table[i][2] as string).replace(/\d[AB]?/, "")
        const departmentId = departmentMp.get(studentDepartment);
        if (departmentId === undefined) {
            failAddingVoter.push({
                id: studentId,
                reason: FailReason.DepartmentNotExist,
            })
            continue;
        }

        students.push({
            id: studentId,
            departmentId: departmentId,
        })
    }

    await prisma.voter.createMany({
        data: students,
    })

    setResponseStatus(event, 200)
    return failAddingVoter;
})
