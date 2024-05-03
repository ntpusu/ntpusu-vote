import prisma from '~/lib/prisma'
import { getServerSession } from '#auth'
export default defineEventHandler(async (event) => {
    const { voter } = getQuery(event) as { voter: string | undefined }

    if (!voter || !/^\d{8,9}$/.test(voter)) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Bad Request',
            message: 'Parameter "voter" is required and must be a number',
        })
    }

    const id = parseInt(voter)
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
            message: '不在管理員名單中'
        })
    }

    const item = await prisma.voter.findUniqueOrThrow({
        where: { id },
        select: {
            login: {
                select: {
                    id: true,
                    time: true,
                },
            },
            department: {
                select: {
                    departmentInGroup: {
                        select: {
                            group: {
                                select: {
                                    name: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    })

    let group = ''
    for (const i of item.department.departmentInGroup) {
        group += i.group.name + ', '
    }

    group = group.slice(0, -2)

    return {
        id,
        group,
        first: {
            serNum: item.login?.id,
            time: item.login?.time,
        },
    }
})
