<template>
  <div>
    <!-- 修改密码 -->
    <a-modal v-model="showPwd" title="修改密码">
      <template slot="footer">
        <div style="padding:10px 0">
          <a-button key="back" @click="showPwd=false">取消</a-button>
          <a-button key="submit" type="primary" :loading="loadPwd" @click="onUpdatePwd(formPwd.id)">确定修改密码</a-button>
        </div>

      </template>
      <a-form :form="formPwd">
        <a-form-item label="原始密码" :colon="true" :labelCol="{span:5}" :wrapperCol="{span:18}" required>
          <a-input v-model='formPwd.old'></a-input>
        </a-form-item>
        <a-form-item label="新密码" :colon="true" :labelCol="{span:5}" :wrapperCol="{span:18}" required>
          <a-input v-model='formPwd.pwd'></a-input>
        </a-form-item>
        <a-form-item label="重复新密码" :colon="true" :labelCol="{span:5}" :wrapperCol="{span:18}" required>
          <a-input v-model='formPwd.pwd2'></a-input>
        </a-form-item>
      </a-form>
    </a-modal>
    <!-- 新建 修改 -->
    <a-modal :title="isCreate?'新建管理员':'更新管理员'" :width="640" :visible="showSysUser" :okText="isCreate?'创建':'更新'" :confirmLoading="userLoading" @ok="()=>{isCreate?onCreateSysUser():onUpdateSysUser()}" @cancel="onCancelSysUser">
      <a-spin :spinning="userLoading">
        <a-form :form="sysUser" :labelCol="{span:4}" :wrapperCol="{span:18}">
          <a-form-item label="账号" :validate-status="sysUserStatus.account?'error':''" :help="sysUserStatus.account" :colon="true" required>
            <a-input v-model="sysUser.account" :disabled="isCreate?false:true" />
          </a-form-item>
          <a-form-item label="用户名" :validate-status="sysUserStatus.name?'error':''" :help="sysUserStatus.name" :colon="true" required>
            <a-input v-model="sysUser.name" />
          </a-form-item>
          <a-form-item label="密码" v-if="isCreate" :validate-status="sysUserStatus.password?'error':''" :help="sysUserStatus.password" :colon="true" required>
            <a-input v-model="sysUser.password" />
          </a-form-item>
          <a-form-item label="Email" :validate-status="sysUserStatus.email?'error':''" :help="sysUserStatus.email" :colon="true">
            <a-input v-model="sysUser.email" />
          </a-form-item>
          <a-form-item label="电话" :validate-status="sysUserStatus.phone?'error':''" :help="sysUserStatus.phone" :colon="true">
            <a-input v-model="sysUser.phone" />
          </a-form-item>
          <a-form-item label="状态">
            <a-switch checked-children="有效" un-checked-children="无效" default-checked v-model="sysUser.status" />
          </a-form-item>
        </a-form>
      </a-spin>
    </a-modal>

    <a-card :bordered="false">
      <div class="table-page-search-wrapper">
        <a-form layout="inline">
          <a-row :gutter="48">
            <a-col :md="8" :sm="24">
              <a-form-item label="账号">
                <a-input v-model="queryParam.account" placeholder />
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="电话">
                <a-input v-model="queryParam.phone" placeholder />
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-button type="primary" @click="queryUser">查询</a-button>
              <a-button style="margin-left: 8px" @click="() => (queryParam = {account:'',phone:''})">重置</a-button>
              <a-button style="margin-left: 8px" type="primary" icon="plus" @click="()=>{isCreate=true, initSysUser(),showSysUser=true}">新建</a-button>
            </a-col>
          </a-row>
        </a-form>
      </div>

      <!-- //table -->

      <a-table ref="table" size="default" :loading='queryLoading' :columns="columns" :data-source="adminUser" :pagination="page" rowKey='id'>

        <span slot="serial" slot-scope="text, record, index">
          {{ index + 1 }}
        </span>
        <span slot="status" slot-scope="text">
          <a-badge v-if="text==true" status="success" text="有效"></a-badge>
          <a-badge v-else status="default" text="无效"></a-badge>
        </span>

        <span slot="action" slot-scope="text, record">

          <template v-if='record.id!=userId'>
            <a @click="onEdit(record)">编辑</a>
            <a-divider type="vertical" />
            <a @click="onDelete(record)">删除</a>
            <a-divider type="vertical" />
            <a @click="onPassword(record)">修改密码</a>
            <a-divider type="vertical" />
            <a @click="onResetPassword(record)">重置密码</a>
          </template>

        </span>

      </a-table>
    </a-card>

  </div>
</template>
<script>
import { queryAdminUser, createAdminUser, updateAdminUser, deleteAdminUser, putPwd, postRestPassword } from '@/api/sysadminuser'
export default {
  name: 'Sysadminuser',
  data () {
    let self = this
    return {
      userId: null,
      showSysUser: false,
      userLoading: false,
      loadPwd: false,
      queryLoading: false,
      isCreate: true,
      showPwd: false,
      queryParam: { account: '', phone: '' },
      columns: [
        {
          title: '#',
          scopedSlots: { customRender: 'serial' }
        },
        {
          title: '账号',
          dataIndex: 'account'
        },
        {
          title: '姓名',
          dataIndex: 'name'
        },
        {
          title: '状态',
          dataIndex: 'status',
          scopedSlots: { customRender: 'status' }
        },
        {
          title: '电话',
          dataIndex: 'phone',
        },
        {
          title: '邮箱',
          dataIndex: 'email'
        },
        {
          title: '操作',
          dataIndex: 'action',
          width: '260px',
          align: 'center',
          scopedSlots: { customRender: 'action' }
        }
      ],
      //分页配置
      page: {
        currend: 1,//当前页码
        pageSize: 10, //当前条数
        total: 0, //总共条数
        defaultPageSize: 10,
        showTotal: total => `共 ${total} 条`,
        showSizeChanger: true,
        pageSizeOptions: ['10', '20', '30', '50', '100'], //limit配置
        onShowSizeChange: (current, size) => self.queryUser({ page: current, limit: size }), //limit改变时的回调
        onChange: (page, size) => self.queryUser({ page: page, limit: size }) //page 改变时的回调
      },
      adminUser: [],

      //用户
      sysUser: {},
      sysUserStatus: {},

      //密码
      formPwd: {},

    }
  },
  methods: {
    //init
    initSysUser () {
      this.sysUser = {
        account: '',
        name: '',
        phone: '',
        email: '',
        status: true,
        password: '',
      }
      this.sysUserStatus = {
        account: '',
        name: '',
        phone: '',
        email: '',
        password: '',
      }
    },
    initPwd () {
      this.formPwd = {
        id: '',
        old: "",
        pwd: "",
        pwd2: '',
      }
    },
    // handler
    queryUser () {
      this.queryLoading = true
      queryAdminUser(this.queryParam, { page: this.page.currend, limit: this.page.pageSize }).then(res => {
        console.log(res, "sysadminuser")
        if (res.code == 200) {
          this.adminUser = res.result.data
          this.page.currend = res.result.page.page
          this.page.total = res.result.page.count
          this.page.pageSize = res.result.page.limit
        } else if (res.message) {
          this.$message.error(res.message)
        }

      }).catch(err => {
        // console.log(err)
        this.$message.error((err.response && err.response.data) || err.message)
      }).finally(() => { this.queryLoading = false })
    },

    //on
    onEdit (recode) {
      this.initSysUser()
      this.isCreate = false
      this.sysUser = Object.assign({}, recode)
      this.showSysUser = true
    },
    onUpdateSysUser () {
      this.userLoading = true
      updateAdminUser(this.sysUser.id, this.sysUser).then(res => {
        if (res.code == 200) {
          this.showSysUser = false
          this.$success({
            title: res.message,
            onOk: () => {
              this.queryUser()
            }
          })
        } else {
          if (res.result.err) {
            this.$error({ title: res.result.err });
          } else {
            this.sysUserStatus = res.result
          }
        }
      }).catch().finally(() => {
        this.userLoading = false
      })
    },
    onDelete (recode) {
      console.log(recode)

      var d = Object.assign({}, recode)
      var self = this
      this.$confirm({
        title: '确定删除 [ ' + d.name + " ] 么?",

        onOk () {
          return deleteAdminUser(d.id).then(
            res => {
              self.$success({ title: res.message })
              self.queryUser()
            }
          ).catch(err => {
            console.log(err)
            if (err.response) {
              self.$error({ page: "错误", content: err.response.data })
            } else {
              self.$error({ page: "错误", content: err.message })
            }
          })
        },
        onCancel () {
          console.log('Cancel');
        },
      });
    },
    onPassword (recode) {
      this.initPwd()
      this.formPwd.id = recode.id
      this.showPwd = true
    },
    onResetPassword (recode) {
      this.$confirm({
        title: '确定重置 [ ' + recode.name + ' ] 的密码么？此操作不可恢复！',
        // content: h => <div style="color:red;">Some descriptions</div>,
        onOk: () => {
          console.log("click")
          var self = this
          return postRestPassword(recode.id).then((res) => {
            console.log(this)
            if (res.code == 200) {
              this.$success({
                title: '密码重置成功',
                // JSX support
                content: "新密码:" + res.result.data + "  注意:此密码只显示一次",
              });
            } else {
              this.$message(res.message || (res.result && res.result.data))
            }
          }).catch(err => {
            this.$message(res.response && res.response.data || res.message)
          })
        },
        onCancel () {
        },
        // class: 'test',
      });
    },
    onUpdatePwd (id) {
      if (this.formPwd.pwd != this.formPwd.pwd2) {
        this.$error({
          title: '两次输入新密码不一致',
        });
        return
      }
      this.loadPwd = true
      putPwd(id, this.formPwd).then(res => {
        this.loadPwd = false
        if (res.code == 200) {
          this.$success({
            title: res.message,
            onOk: () => {
              this.showPwd = false
            }
          })
        } else {
          if (res.result.err) {
            this.$error({ title: res.result.err })
          } else {
            var html = ''
            Object.values(res.result).forEach(d => {
              html = html + '<div>' + d[1] + '</div>  '
            })
            this.$error({ title: "错误", content: html })
          }
        }
      })



    },
    //创建用户
    onCreateSysUser () {
      this.Loading = true
      console.log("create")
      createAdminUser(this.sysUser).then(res => {
        console.log("2create")

        if (res.code == 200) {
          this.showSysUser = false
          this.$success({
            title: res.message,
            onOk: () => {
              this.queryUser()
            }
          })
        } else {
          if (res.result.err) {
            console.log("in err", res)
            this.$error({ title: res.result.err });
          } else {
            this.sysUserStatus = res.result
          }
        }
      }).catch(err => {
        console.log(err)
        if (err.response) {
          this.$error({ page: "错误", content: err.response.data })
        } else {
          this.$error({ page: "错误", content: err.message })
        }
        this.showSysUser = false
      }).finally(() => {
        this.userLoading = false
      })
    },
    onCancelSysUser () {
      this.showSysUser = false
      this.Loading = false
    },

  },
  mounted () {
    let userinfo = this.$store.getters.userInfo
    console.log(userinfo)
    if (userinfo) {
      this.userId = userinfo.id
    }
    console.log(userinfo)
    this.queryUser()

  },

}
</script>
