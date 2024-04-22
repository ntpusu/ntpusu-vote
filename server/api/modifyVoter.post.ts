import prisma from '~/lib/prisma'
import { getServerSession } from '#auth'
export default defineEventHandler(async (event) => {
    const { voterId, voterDepartment } = await readBody(event) as {
        voterId: number
        voterDepartment: string
    }

    const session = await getServerSession(event) as { user: { email: string } } | null

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

    const {
        id: DepartmentId,
    } = await prisma.department.findUniqueOrThrow({
        where: { name: voterDepartment, },
        select: {
            id: true
        }
    }).catch(() => {
        throw createError({
            message: `${voterDepartment} 不在資料庫中`
        })
    })

    await prisma.voter.update({
        where: {
            id: voterId,
        },
        data: {
            departmentId: DepartmentId
        }
    })

    return {}
})
