<template>
    <ClientOnly>
        <div
            class="my-4 mx-auto w-full p-5 sm:w-7/12 sm:rounded-2xl sm:border-4 sm:border-dashed sm:border-blue-200 md:w-1/2 lg:w-5/12 xl:w-1/3 2xl:w-1/4"
        >
            <el-alert
                title="將連線至學生資訊系統進行驗證"
                description="請使用學生資訊系統的帳號密碼登入"
                show-icon
                close-text="了解～"
            />
            <div class="h-4"></div>
            <el-form
                ref="formRef"
                :model="itemEl"
                :label-width="'auto'"
                label-suffix=":"
                :rules="rules"
                hide-required-asterisk
                @keyup.enter.capture="submitForm(formRef)"
            >
                <el-form-item label="學號" prop="username">
                    <el-input
                        v-model.trim="itemEl.username"
                        placeholder="請輸入學號"
                        clearable
                    />
                </el-form-item>
                <el-form-item label="密碼" prop="password">
                    <el-input
                        v-model.trim="itemEl.password"
                        type="password"
                        placeholder="請輸入密碼"
                        show-password
                        clearable
                    />
                </el-form-item>
                <div class="flex justify-center">
                    <el-form-item prop="verify">
                        <el-checkbox
                            v-model="itemEl.verify"
                            label="同意使用學生資訊系統進行驗證"
                        />
                    </el-form-item>
                </div>
                <el-form-item>
                    <el-button
                        type="primary"
                        class="m-auto"
                        :loading="isLoad"
                        @click="submitForm(formRef)"
                        >登入</el-button
                    >
                </el-form-item>
            </el-form>
            <el-alert
                v-if="loginFail"
                title="登入失敗"
                type="error"
                description="請確認學號密碼是否正確"
                show-icon
            />
        </div>
    </ClientOnly>
</template>

<script lang="ts" setup>
import type { FormInstance, FormRules } from 'element-plus'

definePageMeta({
    middleware: ['auth'],
})

const itemEl = reactive({
    username: '',
    password: '',
    verify: false,
})

const isLoad = ref(false)
const loginFail = ref(false)
const loginState = useState('loginState')

const formRef = ref<FormInstance>()
const rules = reactive<FormRules>({
    username: [
        { required: true, message: '學號為必填', trigger: 'blur' },
        { pattern: /^\d+$/, message: '學號格式錯誤', trigger: 'change' },
        { pattern: /^\d+$/, message: '學號格式錯誤', trigger: 'blur' },
    ],
    password: [{ required: true, message: '密碼為必填', trigger: 'blur' }],
    verify: [
        {
            pattern: /true/,
            message: '需同意使用學生資訊系統進行驗證',
            trigger: 'change',
        },
    ],
})

const submitForm = async (formEl: FormInstance | undefined) => {
    if (!formEl) return

    await formEl.validate(async (valid, fields) => {
        if (valid) {
            isLoad.value = true

            const res = await $fetch('/api/login', {
                method: 'POST',
                body: JSON.stringify({
                    username: itemEl.username,
                    password: itemEl.password,
                }),
            })

            if (res.login) {
                await useRouter().push('/')
            } else {
                loginFail.value = true
            }

            isLoad.value = false
        }
    })
}

onMounted(async () => {
    if (loginState.value) {
        await useRouter().push('/')
    }
})
</script>
