import { NuxtAuthHandler } from '#auth'
import GoogleProvider from 'next-auth/providers/google'
import AzureProvider from 'next-auth/providers/azure-ad'
export default NuxtAuthHandler({
    secret: process.env.AUTH_SECRET,
    providers: [
        (GoogleProvider as any).default({
            clientId: process.env.GOOGLE_ID as string,
            clientSecret: process.env.GOOGLE_SECRET as string,
        }),
        (AzureProvider as any).default({
            clientId: process.env.AZURE_ID as string,
            clientSecret: process.env.AZURE_SECRET as string,
            tenantId: process.env.AZURE_TENANT as string,
        }),
    ]
})