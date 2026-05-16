import prisma from '~/lib/prisma'

const defaultSiteInfo = {
    bulletinUrl: '',
    guideUrl: '',
    guideSource: 'instagram',
}

export default defineEventHandler(async (event) => {
    const settings = await prisma.siteSetting.findMany({
        where: {
            key: {
                in: ['bulletinUrl', 'guideUrl', 'guideSource'],
            },
        },
    })

    const siteInfo = { ...defaultSiteInfo }

    for (const setting of settings) {
        if (setting.key === 'bulletinUrl') {
            siteInfo.bulletinUrl = setting.value
        }

        if (setting.key === 'guideUrl') {
            siteInfo.guideUrl = setting.value
        }

        if (setting.key === 'guideSource' && ['instagram', 'gdrive'].includes(setting.value)) {
            siteInfo.guideSource = setting.value
        }
    }

    setResponseStatus(event, 200)
    return siteInfo
})
