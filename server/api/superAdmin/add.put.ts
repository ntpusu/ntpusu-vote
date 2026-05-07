import prisma from '~/lib/prisma'

export default defineEventHandler(async (event) => {
    if (!event.context.session) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized',
            message: '未登入',
        })
    }

    if (!event.context.isSuperAdmin) {
        throw createError({
            statusCode: 403,
            statusMessage: 'Forbidden',
            message: '不是超級管理員',
        })
    }

    const { id } = getQuery(event) as { id: string | undefined }
    const superAdminId = Number(id)

    if (!id || !Number.isInteger(superAdminId)) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Bad Request',
            message: 'Parameter "id" is required and must be a number.',
        })
    }

    const superAdmin = await prisma.$transaction(async (tx) => {
        await tx.$executeRawUnsafe(`
            TRUNCATE TABLE
                "Ballot",
                "Candidate",
                "VotingFromGroup",
                "Voting",
                "VoterLogin",
                "Voter",
                "DepartmentInGroup",
                "Department",
                "Group",
                "Admin",
                "VotingTimeline",
                "SuperAdmin"
            RESTART IDENTITY CASCADE
        `)

        return await tx.superAdmin.create({
            data: { id: superAdminId },
        })
    })

    setResponseStatus(event, 201)
    return superAdmin.id
})
