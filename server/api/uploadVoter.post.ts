import prisma from '~/lib/prisma'
import { getServerSession } from '#auth'
import * as XLSX from 'xlsx';
import type { Prisma } from '@prisma/client';

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

    const departmentMp = new Map<string, number>()
    await prisma.department.findMany({
        select: {
            id: true,
            name: true,
        },
    }).then((departments) => {
        if(!departments) {
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

    for(let i = 1; i < voter_table.length; i++ ) {
        const studentId = voter_table[i][0] as number
        if (studentIdSet.has(studentId)) {
            failAddingVoter.push({
                id: studentId,
                reason: FailReason.DuplicateStudentId//'此資料表中有重複學號 將只會新增第一筆投票者資料'
            })
            continue;
        }
        else {
            studentIdSet.add(studentId)
        }
        if(isNaN(studentId) || (studentId <= 100000000 || studentId >= 1000000000) ) {
            failAddingVoter.push({
                id: studentId,
                reason: FailReason.InvalidStudentId,//'學號格式錯誤'
            })
            continue;
        }
        const studentDepartment = (voter_table[i][2] as string).replace(/\d[AB]?/, "")
        const departmentId = departmentMp.get(studentDepartment);
        if (departmentId === undefined) {
            failAddingVoter.push({
                id: studentId,
                reason: FailReason.DepartmentNotExist,//'系所不存在'
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

    return failAddingVoter;
})