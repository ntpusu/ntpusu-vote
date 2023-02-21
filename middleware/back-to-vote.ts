import type { VoteSession } from "@prisma/client"
export default defineNuxtRouteMiddleware(async (to, from) => {
    const { id } = to.params as { id: string }

    const VS = await $fetch('/api/uniVs?' + new URLSearchParams({ id })) as unknown as VoteSession | null

    if (VS === null || new Date(VS.endTime) > new Date()) {
        return await navigateTo('/vote')
    }
})