<template>
  <div class="add-form">
    <!-- dialogFormVisible控制弹出框dialog显隐 ;close-on-click-modal禁止点击对话框以外导致对话框关闭  :before-close右上角关闭按钮事件-->
    <el-dialog title="添加用户" :visible.sync="dialogFormVisible" :before-close="cancel" :close-on-click-modal="false" :width="'40%'">
      <!-- :model绑定表单对象  status-icon控制每一行表单校验通过后图标显示正确和错误   :rules绑定校验规则
              autocomplete="off" 关闭表单默认以及功能-->
      <el-form :model="formBase" status-icon :rules="rules" ref="refForm" label-width="120px">
        <el-form-item label="用户名" prop="username" >
          <el-input v-model="formBase.username" autocomplete="off"></el-input>
        </el-form-item>

        <el-form-item label="密码" prop="userPassword" >
          <el-input v-model="formBase.userPassword" autocomplete="off"></el-input>
        </el-form-item>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancel">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
<!--        <el-button @click="resetForm('refForm')">重置</el-button>-->
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import {add} from "@/api/base/users"
  export default {
    name: "UserAddForm",

    data() {
      return {

        //定义弹框绑定显示状态
        dialogFormVisible: false,
        //定义表单初始化参数
        formBase: {
          username: '',
          userPassword: '',
        },
        //v-model 绑定校验规则
        rules: {
          username: [
            {required: true, message: '请输入用户名', trigger: 'blur'},
            {min: 6, max: 11, message: '用户名长度在 6 到 11 个字符', trigger: 'blur'}
          ],
          userPassword: [{required: true, message: '请输入密码', trigger: 'blur'},
            {min: 6, max: 16, message: '密码长度在 6 到 16个字符', trigger: 'blur'}]
        },
      }

    },
    methods: {
      //取消对话框事件
      cancel() {
        this.dialogFormVisible = false
        this.$refs['refForm'].resetFields();
      },
      submitForm(){
        this.$refs['refForm'].validate((valid) => {
          if (valid) {
            add(this.formBase).then(res => {
              let resp  = res.data;
              this.$message({message:resp.msg,type:resp.code===200?"success":"error"});
              if(resp.code===200) {
                this.dialogFormVisible = false
                this.$refs['refForm'].resetFields();
                this.$emit('refresh-table', {})
              }
            })
          } else {
            return false;
          }
        });

      },
      resetForm(formName) {
        this.$nextTick(() => {
          this.$refs[formName].resetFields();
        })
      },
      createData() {

      },
      handleNodeClick(data) {

      },
    },
    // 创建完毕状态
    created: function () {
        if (this.rowEditData){
          this.$message.success(this.rowEditData);
        }

    },
  }
</script>

<style scoped>
.el-input{
  width: 300px;
}

</style>
