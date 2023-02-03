<template>
  <div>
    user: {{ username }}
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
    if (un != null && un != '')
      this.username = AES.decrypt(un, config.public.CRYPTO_KEY).toString(encUtf8)
    else
      this.username = '未登入'
  }
}

</script>