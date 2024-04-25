import prisma from '~/lib/prisma'
import { getServerSession } from '#auth'
import * as XLSX from 'xlsx';
export default defineEventHandler(async (event) => {
    const session = await getServerSession(event) as { user: { email: string } } | null
    const formData = (await readMultipartFormData(event))!
    const file = formData[1].data

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

    const group_workbook = XLSX.read(file)
    const group_sheet = group_workbook.Sheets[group_workbook.SheetNames[0]]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const group_table: any[][] = XLSX.utils.sheet_to_json(group_sheet, { header: 1 })

    let allGroups: string[] = []
    for (let i = 1; i < group_table.length; i++) {
        const Group = group_table[i].slice(1,4) as string[]
        allGroups = allGroups.concat(Group)
    }

    allGroups = Array.from(new Set(allGroups))
    await prisma.group.createMany({
        data: allGroups.map((group) => {
            return {
                name: group,
            }
        }),
        skipDuplicates: true,
    })

    for (let i = 1; i < group_table.length; i++) {
        const department = group_table[i][0] as string
        const groups = group_table[i].slice(1,4) as string[]

        await prisma.department.create({
            data: {
                name: department,
                departmentInGroup: {
                    create:[
                        {
                            group: {
                                connect: {
                                    name: groups[0],
                                }
                            }
                        },
                        {
                            group: {
                                connect: {
                                    name: groups[1],
                                }
                            }
                        },
                        {
                            group: {
                                connect: {
                                    name: groups[2],
                                }
                            }
                        }
                    ]
                }
            }
        })
    }

    return  {}
})
