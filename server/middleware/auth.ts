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

    // 確認是否為(超級)管理員
    const isSuperAdmin = idStr === process.env.SUPER_ADMIN
    event.context.isSuperAdmin = isSuperAdmin
    event.context.isAdmin = isSuperAdmin

    const [admin, voter] = await Promise.all([
      isSuperAdmin
        ? Promise.resolve({})
        : prisma.admin.findUnique({
          where: { id: studentId },
          select: null,
        }),
      prisma.voter.findUnique({
        where: { id: studentId },
        select: null,
      }),
    ])

    if (!isSuperAdmin) {
      event.context.isAdmin = admin !== null
    }

    // 確認是否在選舉人名錄中
    event.context.isVoter = voter !== null
  }
})
