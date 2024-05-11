import prisma from '~/lib/prisma'
import { getServerSession } from '#auth'
export default defineEventHandler(async (event) => {
  // 確認登入資訊
  const session = await getServerSession(event)
  event.context.session = session

  if (session) {
    // 學號
    const idStr = session.user!.email!.substring(1, 10)
    event.context.id = idStr

    // 確認是否為(超級)管理員
    const isSuperAdmin = idStr === process.env.SUPER_ADMIN
    event.context.isSuperAdmin = isSuperAdmin
    event.context.isAdmin = isSuperAdmin

    if (!isSuperAdmin) {
      const admin = await prisma.admin.findUnique({
        where: { id: parseInt(idStr) },
        select: null,
      })

      event.context.isAdmin = admin !== null
    }

    // 確認是否在選舉人名錄中
    const voter = await prisma.voter.findUnique({
      where: { id: parseInt(idStr) },
      select: null,
    })

    event.context.isVoter = voter !== null
  }
})
