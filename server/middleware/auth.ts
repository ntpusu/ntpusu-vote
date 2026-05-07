import prisma from '~/lib/prisma'
import { getServerSession } from '#auth'

const getStudentIdFromEmail = (email?: string | null) => {
  const localPart = email?.split('@')[0]
  const match = localPart?.match(/\d{9}/)
  return match?.[0] ?? null
}

export default defineEventHandler(async (event) => {
  // 確認登入資訊
  const session = await getServerSession(event)
  event.context.session = session

  if (session) {
    // 學號
    const idStr = getStudentIdFromEmail(session.user?.email)
    if (!idStr) {
      event.context.isSuperAdmin = false
      event.context.isAdmin = false
      event.context.isVoter = false
      return
    }

    const studentId = Number(idStr)
    event.context.id = idStr

    const [
      registeredSuperAdmin,
      anySuperAdmin,
      admin,
      voter,
    ] = await Promise.all([
      prisma.superAdmin.findUnique({
        where: { id: studentId },
        select: { id: true },
      }),
      prisma.superAdmin.findFirst({
        select: { id: true },
      }),
      prisma.admin.findUnique({
        where: { id: studentId },
        select: null,
      }),
      prisma.voter.findUnique({
        where: { id: studentId },
        select: null,
      }),
    ])

    const isBootstrapSuperAdmin
      = anySuperAdmin === null && idStr === process.env.SUPER_ADMIN

    event.context.isSuperAdmin = registeredSuperAdmin !== null || isBootstrapSuperAdmin
    event.context.isAdmin = event.context.isSuperAdmin || admin !== null

    // 確認是否在選舉人名錄中
    event.context.isVoter = voter !== null
  }
})
