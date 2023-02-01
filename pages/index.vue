<template>
  <div>
    <el-form v-if="login_status">
      <el-form-item label="學號:">
        <el-input v-model="username" placeholder="請輸入學號" clearable />
      </el-form-item>
      <el-form-item label="密碼:">
        <el-input v-model="password" type="password" placeholder="請輸入密碼" show-password clearable />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit">登入</el-button>
      </el-form-item>
    </el-form>
    <div v-else>
      {{ username }}
      {{ password }}
    </div>
    {{ login_status }}
  </div>
</template>

<script>
export default {
  data() {
    return {
      username: '',
      password: '',
      login_status: false,
    }
  },
  methods: {
    async onSubmit() {
      this.cnt += 1
      const res = await $fetch('/api/login', {
        method: 'POST',
        body: JSON.stringify({
          'username': this.username,
          'password': this.password
        })
      })

      this.login_status = res
      if (res) {
        // setCookie('login_status', true)
        // setCookie('username', this.username)
        sessionStorage.setItem('login_status', true)
        sessionStorage.setItem('username', this.username)
      }
    }
  },
  mounted() {
    // this.login_status = getCookie('login_status')
    // this.username = getCookie('username')
    this.login_status = sessionStorage.getItem('login_status')
    this.username = sessionStorage.getItem('username')
  }
}

</script>