<template>
  <div>
    <NuxtLink to="/login">login</NuxtLink>
  </div>
  <div>
    welcome {{ username }}
  </div>
</template>

<script>
import AES from 'crypto-js/aes'
import encUtf8 from 'crypto-js/enc-utf8'

export default {
  data() {
    return {
      username: '',
    }
  },
  methods: {

  },
  async mounted() {
    const config = useRuntimeConfig()
    let un = await $fetch('/api/un')
    console.log(un)
    if (un != null && un != '')
      this.username = AES.decrypt(un, config.public.CRYPTO_KEY).toString(encUtf8)
  }
}

</script>