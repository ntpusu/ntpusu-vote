export default defineNuxtRouteMiddleware(async (to, from) => {
    const { id } = to.params as { id: string }

    console.log(id)

    const voteSession = await $fetch('/api/uniVs?' + new URLSearchParams({ id })) as any

    if (new Date(voteSession!.endTime).getTime() > Date.now()) {
        return await navigateTo('/vote')
    }
})