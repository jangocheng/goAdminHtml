<template>
  <div class="page-header-index-wide">
    <a-card :bordered="false" :bodyStyle="{ padding: '16px 0', height: '100%' }" :style="{ height: '100%' }">
      <div class="account-settings-info-main" :class="device">
        <div class="account-settings-info-left">
          <a-menu :mode="device == 'mobile' ? 'horizontal' : 'inline'" :style="{ border: '0', width: device == 'mobile' ? '560px' : 'auto'}" :selectedKeys="selectedKeys" type="inner" @click="handleClick">
            <a-menu-item key="1">
              <span>基本设置</span>
            </a-menu-item>
            <a-menu-item key="2">
              <span>
                密码设置
              </span>
            </a-menu-item>
          </a-menu>
        </div>
        <div class="account-settings-info-right">
          <div class="account-settings-info-title">
            <span>{{key=='1'?'基本设置':'密码设置'}}</span>
          </div>
          <div v-if="key=='1'">
            <a-row :gutter="16">
              <a-col :md="24" :lg="16">
                <a-form :form="user">
                  <a-form-item label="账号" :colon="true">
                    <a-input :value="user.account" disabled />
                  </a-form-item>
                  <a-form-item label="昵称" :colon="true">
                    <a-input v-model="user.name" />
                  </a-form-item>
                  <a-form-item label="电子邮件" :colon="true" :validate-status="userStatus.email?'error':''" :help="userStatus.email">
                    <a-input v-model="user.email" />
                  </a-form-item>

                  <a-form-item label="手机号" :colon="true" :validate-status="userStatus.phone?'error':''" :help="userStatus.phone">
                    <a-input v-model="user.phone" />
                  </a-form-item>
                  <a-form-item>
                    <a-button type="primary" @click="onPutInfo" :loading="btnloading">提交</a-button>
                  </a-form-item>
                </a-form>
              </a-col>
            </a-row>

          </div>
          <div v-else>
            <a-row :gutter="16">
              <a-col :md="24" :lg="16">
                <a-form :form="password">
                  <a-form-item label="原始密码" :colon="true" :validate-status="passwordStatus.oldPassword?'error':''" :help="passwordStatus.oldPassword">
                    <a-input v-model="password.oldPassword" type="password"/>
                  </a-form-item>
                  <a-form-item label="新密码" :colon="true" :validate-status="passwordStatus.password?'error':''" :help="passwordStatus.password">
                    <a-input v-model="password.password" type="password"/>
                  </a-form-item>

                  <a-form-item label="重复新密码" :colon="true" :validate-status="passwordStatus.backpassword?'error':''" :help="passwordStatus.backpassword">
                    <a-input v-model="backpassword" type="password"/>
                  </a-form-item>
                  <a-form-item>
                    <a-button type="primary" @click='onResetPassword' :loading="loading.resetPassword">提交</a-button>
                  </a-form-item>
                </a-form>
              </a-col>
            </a-row>
          </div>
        </div>
      </div>
    </a-card>
  </div>
</template>
<script>
import { mixinDevice } from '@/utils/mixin.js'
import { getUserInfo, putUserInfo, putUserPassword } from '@/api/userinfo.js'
import { ACCESS_TOKEN,USER_INFO,USER_NAME } from '@/store/mutation-types'
export default {
  mixins: [mixinDevice],
  name: "account",
  data () {    return {
      loading: {
        resetPassword: false,
      },
      mode: 'inline',
      openKeys: [],
      selectedKeys: ['1'],
      key: "1",
      user: {
        account: "",
        name: "",
        phone: "",
        email: "",
      },
      btnloading: false,
      userStatus: {
      },
      password: {
        oldPassword: '',
        password: '',

      },
      backpassword: "",
      passwordStatus: {

      }


    }  },

  methods: {
    handleClick (v) {
      this.selectedKeys = v.keyPath
      this.key = v.key
    },
    getInfo () {

      getUserInfo().then(res => {
        console.log(res)
        if (res.code == 200) {
          // this.user = res.result.data
          this.user.account = res.result.data.account
          this.user.name = res.result.data.name
          this.user.phone = res.result.data.phone
          this.user.email = res.result.data.email
        } else {
          console.log("获取用户失败")
        }
      }).catch(error => {
        console.log(error)
        console.log("获取用户数据失败")
      })
    },
    //修改用户信息
    onPutInfo () {
      this.userStatus = {}
      this.btnloading = true
      putUserInfo(this.user).then(res => {
        if (res.code == 200) {

          this.$success({
            title: res.message,
          })
        } else
          if (res.result.err) {
            this.$error({ title: res.result.err });
          } else {
            this.userStatus = res.result
          }
      }).catch(error => {
        // console.log(error.message)
        this.$error({ title: error.message || "修改失败" })
      }).finally(() => {
        this.btnloading = false
      })
    },
    //修改密码
    onResetPassword () {
      if (this.password.password != this.backpassword) {
        this.$error({ title: "两次输入密码不一致" })
        return
      }

      this.loading.resetPassword = true
      this.passwordStatus = {}
      var self = this
      putUserPassword(this.password).then(res => {
        if (res.code == 200) {
          console.log(res)
          this.$success({
            title: "修改成功,即将重新登录！", onOk () {
              self.$ls.remove(ACCESS_TOKEN)
              self.$ls.remove(USER_INFO)
              self.$ls.remove(USER_NAME)
              window.location.reload()

            }
          })
        } else {
          if (res.result.err) {
            this.$error({ title: res.result.err })
          } else {
            this.passwordStatus = res.result
          }
        }
      }).finally(() => {
        this.loading.resetPassword = false
      })
    }

  },
  mounted () {
    this.getInfo()
    console.log("mounted")
  },

}
</script> 
<style lang="less" scoped >
.account-settings-info-main {
  width: 100%;
  display: flex;
  height: 100%;
  overflow: auto;

  &.mobile {
    display: block;

    .account-settings-info-left {
      border-right: unset;
      border-bottom: 1px solid #e8e8e8;
      width: 100%;
      height: 50px;
      overflow-x: auto;
      overflow-y: scroll;
    }
    .account-settings-info-right {
      padding: 20px 40px;
    }
  }

  .account-settings-info-left {
    border-right: 1px solid #e8e8e8;
    width: 224px;
  }

  .account-settings-info-right {
    flex: 1 1;
    padding: 8px 40px;

    .account-settings-info-title {
      color: rgba(0, 0, 0, 0.85);
      font-size: 20px;
      font-weight: 500;
      line-height: 28px;
      margin-bottom: 12px;
    }
    .account-settings-info-view {
      padding-top: 12px;
    }
  }
}
</style>