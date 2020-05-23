<template>
  <div class="main">
    <a-form id="formLogin" class="user-layout-login" :form="form" @submit="handleSubmit">
      <a-alert v-if="isLoginError" type="error" showIcon style="margin-bottom: 24px;" :message="message" />
      <a-form-item>
        <a-input v-model="form.account" size="large" type="text" placeholder="请输入账户" required :validate-status="inputStatus.account?'error':''" :help="inputStatus.account">
          <a-icon slot="prefix" type="user" :style="{ color: 'rgba(0,0,0,.25)' }" />
        </a-input>
      </a-form-item>
      <a-form-item>
        <a-input v-model="form.password" size="large" type="password" autocomplete="false" placeholder="请输入密码" required :validate-status="inputStatus.password?'error':''" :help="inputStatus.password">
          <a-icon slot="prefix" type="lock" :style="{ color: 'rgba(0,0,0,.25)' }" />
        </a-input>
      </a-form-item>
      <a-form-item style="margin-top:24px">
        <a-button size="large" type="primary" htmlType="submit" class="login-button" :loading="state.loginBtn" :disabled="state.loginBtn">确定</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script>
import md5 from 'md5'
import { mapActions } from 'vuex'
import { timeFix } from '@/utils/util'
import { getSmsCaptcha, get2step, getInfo } from '@/api/login'

export default {
  data () {
    return {
      message: "",
      inputStatus: {
        account: "",
        password: "",
      },
      form: {
        account: "",
        password: "",
      },
      loginBtn: false,
      // login type: 0 email, 1 username, 2 telephone
      loginType: 0,
      isLoginError: false,
      requiredTwoStepCaptcha: false,
      stepCaptchaVisible: false,
      // form: this.$form.createForm(this),
      state: {
        time: 60,
        loginBtn: false,
        // login type: 0 email, 1 username, 2 telephone
        loginType: 0,
        smsSendBtn: false
      }
    }
  },
  created () {
  },
  methods: {
    ...mapActions(['Login', 'Logout', 'GetInfo']),
    handleSubmit (e) {
      e.preventDefault()
      this.state.loginBtn = true
      this.inputStatus.account = ""
      this.inputStatus.password = ""
      this.isLoginError = false
      var ok = true
      if (!this.form.account || this.form.account == "") {
        this.inputStatus.account = "请填写账号"
        ok = false
      }
      if (!this.form.password || this.form.password == "") {
        this.inputStatus.password = "请填写密码"
        ok = false
      }
      if (!ok) {
        this.state.loginBtn = false
        return
      }
      this.Login(this.form).then(res => {
        if (res.code == 200 && res.result && res.result.token) {
          this.GetInfo().then(res => {
            this.$router.push({ path: '/' })
            // 延迟 1 秒显示欢迎信息
            setTimeout(() => {
              this.$notification.success({
                message: '欢迎',
                description: `${timeFix()}，欢迎回来`
              })
            }, 1000)
          }).catch(err => {
            this.$notification['error']({
              message: '获取用户详情失败',
              description: ((err.response && err.response.data) || err.message),
              duration: 4
            })
          })
          this.isLoginError = false
        } else if (res.code == 400) {
          this.isLoginError = true
          this.message = res.message
        } else {
          this.message = "登录失败！"
        }
        this.state.loginBtn = false
      }).catch(err => {
        this.state.loginBtn = false
        this.$notification['error']({
          message: '错误',
          description: '请求出现错误，请稍后再试',
          duration: 4
        })
      })
    },

  }
}
</script>

<style lang="less" scoped>
.user-layout-login {
  label {
    font-size: 14px;
  }

  .getCaptcha {
    display: block;
    width: 100%;
    height: 40px;
  }

  .forge-password {
    font-size: 14px;
  }

  button.login-button {
    padding: 0 15px;
    font-size: 16px;
    height: 40px;
    width: 100%;
  }

  .user-login-other {
    text-align: left;
    margin-top: 24px;
    line-height: 22px;

    .item-icon {
      font-size: 24px;
      color: rgba(0, 0, 0, 0.2);
      margin-left: 16px;
      vertical-align: middle;
      cursor: pointer;
      transition: color 0.3s;

      &:hover {
        color: #1890ff;
      }
    }

    .register {
      float: right;
    }
  }
}
</style>
