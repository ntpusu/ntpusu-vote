import prisma from '~/lib/prisma'

export default defineEventHandler(async (event) => {
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

    const { bulletinUrl, guideUrl, guideSource } = await readBody(event) as {
        bulletinUrl: string
        guideUrl: string
        guideSource: string
    }

    if (!bulletinUrl || !guideUrl || !['instagram', 'gdrive'].includes(guideSource)) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Bad Request',
            message: 'Invalid site info.',
        })
    }

    await prisma.$transaction([
        prisma.siteSetting.upsert({
            where: { key: 'bulletinUrl' },
            create: { key: 'bulletinUrl', value: bulletinUrl },
            update: { value: bulletinUrl },
        }),
        prisma.siteSetting.upsert({
            where: { key: 'guideUrl' },
            create: { key: 'guideUrl', value: guideUrl },
            update: { value: guideUrl },
        }),
        prisma.siteSetting.upsert({
            where: { key: 'guideSource' },
            create: { key: 'guideSource', value: guideSource },
            update: { value: guideSource },
        }),
    ])

    setResponseStatus(event, 204)
    return null
})
