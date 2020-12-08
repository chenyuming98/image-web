<template>

  <div>
    <el-card class="box-card">
      <!--表头菜单-->
      <div class="tableHeaderToolButtonGroup">
        <el-button icon="el-icon-plus" size="mini"  @click="handleAdd" ></el-button>
        <el-button  icon="el-icon-delete" size="mini"   @click="batchDelete" ></el-button>
      </div>
    </el-card>
    <el-card class="tableCard" >
      <!--表格内容  ref绑定选中内容-->
      <el-table :data="dataList"  style="width: 100%" border  ref="multipleTable" >
        <el-table-column type="selection" width="40" prop="userId"> </el-table-column>
        <el-table-column  prop="username"  label="用户名" > </el-table-column>
        <el-table-column
          prop="role"
          label="角色"
          :formatter="formatterRoles"
          >
        </el-table-column>
        <el-table-column
          prop="userStatus"
          label="状态">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.userStatus"
              active-color="#13ce66"
              :active-value= 0
              :inactive-value=  1
              @change="handleStatus(scope.row)">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column  fixed="right"  label="操作" >
          <template slot-scope="scope">
            <el-button @click="handleRowEdit(scope.row)"   type="text" size="small">+分配员工</el-button>
            <el-button @click="handleRowEdit(scope.row)"   type="text" size="small">编辑</el-button>
            <el-button @click="handleRowDelete(scope.row)" type="text" size="small">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!--表格分页-->
      <div class="block">
        <!-- current-page 当前页数  每页显示数-->
        <div class="tablePagination">
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="requestParameters.page"
            :page-size="requestParameters.size"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total">
          </el-pagination>
        </div>
      </div>

    </el-card>

    <!--2. 添加编辑表单  -->
    <el-dialog :title="formTitle"  :visible.sync="dialogFormVisible" :before-close="cancel" :close-on-click-modal="false" :width="'40%'">
      <!-- :model绑定表单对象  status-icon控制每一行表单校验通过后图标显示正确和错误   :rules绑定校验规则
              autocomplete="off" 关闭表单默认以及功能-->
      <el-form :model="formBase" status-icon :rules="rules" ref="refForm" label-width="120px">
        <el-form-item label="用户名" prop="formUsername" >
          <el-input v-model="formBase.username" autocomplete="off"></el-input>
        </el-form-item>

        <el-form-item label="密码" prop="formUserPassword" >
          <el-input v-model="formBase.userPassword" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="角色分配" prop="" >
          <el-select v-model="userHaveRoles" multiple placeholder="请选择" >
            <el-option  v-for="item in rolesData" :key="item.roleId"   :label="item.roleName"   :value="item.roleId">
            </el-option>
          </el-select>
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
<!--主页面板-->
<script>
  import {list,add,update,remove,batchRemove} from "@/api/base/users"
  import {findRoleAll} from "@/api/base/role";
  import {showLoading,hideLoading} from '@/utils/loadingUtils';
  const  multipleSelectionList =  new Set([]);
    export default {

      data() {
        return {
          userAdd: 'UserAdd',
          dataList: [],
          multipleSelection: multipleSelectionList,
          total: 0,
          requestParameters: {
            page: 1,
            size: 10,
          },
          userHaveRoles: [],
          rolesData: [],
          //定义弹框绑定显示状态
          dialogFormVisible: false,
          formTitle : '添加',
          //定义表单初始化参数
          formBase: {
            userId: '',
            username: '',
            userPassword: '',
            roleIds:[],
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

        /*
        * 查询用户表格
        */
        doQuery(params) {
          list(this.requestParameters)
            .then(res => {
              let resp = res.data;
              this.dataList = resp.data;
              this.total = resp.total;

            })
        },

        /*
        * 查询所有角色
        */
        doQueryRoles() {
          findRoleAll()
            .then(res => {
              let resp = res.data;
              this.rolesData = resp.data;
            })
        },

        /*
        *改变每页显示数
        */
        handleSizeChange(val) {
          this.requestParameters.size = val;
          this.doQuery()
        },

        /*
        *改变当前页码数
       */
        handleCurrentChange(val) {
          this.requestParameters.page = val;
          this.doQuery()
        },

        /**
         * 表格格式化内容
         */
        formatterRoles(row, column) {
          let roles = row['roles'];
          let rolesNames = '';
          if (roles) {
            $.each(roles, function (index, val) { //index是数组对象索引，val是对象
              if (index === 0) {
                rolesNames = val.roleName;
              } else {
                rolesNames = rolesNames + ',' + val.roleName;
              }
            });
          }
          return rolesNames;
        },

        /**
         * 添加新员工
         */
        handleAdd() {
          this.doQueryRoles();
          this.formBase = {
            userId: '',
            username: '',
            userPassword: '',
          };
          this.formTitle = "添加";
          this.dialogFormVisible = true
        },

        /**
         * 表格行编辑
         */
        handleRowEdit(rowData){
          this.doQueryRoles();
          let roles = rowData['roles'];
          if (roles) {
            let roleIds = [];
            $.each(roles, function (index, val) { //index是数组对象索引，val是对象
              if (val.roleId!=undefined){
                roleIds.push(val.roleId);
              }
            });
            this.userHaveRoles = roleIds
          }
          this.formTitle = "编辑";
          this.formBase = {
            userId: rowData.userId,
            username: rowData.username,
          };
          this.dialogFormVisible = true;
        },

        /**
         * 表格行删除员工
         */
        handleRowDelete(rowData) {
          this.$confirm(
            `本次操作将删除[ ${rowData.username} ]删除后账号将不可恢复，您确认删除吗？`, {
              type: 'warning'
            }
          ).then(() => {
            showLoading();
            remove({id: rowData.userId})
              .then(res => {
                let resp = res.data;
                if (resp.code === 200) {
                  hideLoading();
                  this.$message.success('删除成功!');
                  this.doQuery();
                } else {
                  this.$message.success(resp.msg);
                }
              })
          }).catch(() => {
          });
        },

        /**
         *  表头批量删除员工
         */
        batchDelete() {
          let list = this.$refs.multipleTable.selection;
          if (list.length===0){
            this.$message.warning("请勾选操作对象！");
            return false;
          }
          let deleteNames,deleteIds;
          let submitData = new FormData();
          for (let i = 0; i < list.length; i++) {
            if (i===0){
              deleteNames = list[i].username;
              deleteIds = list[i].userId;
            }else {
              deleteNames += ","+list[i].username;
              deleteIds +=  ","+list[i].userId;
            }
          }
          this.$confirm(  `本次操作将删除[ ${ deleteNames } ],删除后账号将不可恢复，您确认删除吗？`, {
              type: 'warning'
            }  ).then(() => {
            submitData.append("ids",deleteIds);
            batchRemove(submitData)
              .then(res => {
                let resp = res.data;
                if (resp.code === 200) {
                  this.$message.success('删除成功!');
                  this.doQuery();
                } else {
                  this.$message.error(resp.msg);
                }
              })
          }).catch(() => {
          });

        },

        /**
         * 表单取消对话框事件
         */
        cancel() {
          this.dialogFormVisible = false;
          this.userHaveRoles = [];
          this.$refs['refForm'].resetFields();
        },


        /**
         * 提交表单
         */
        submitForm(){
          this.$refs['refForm'].validate((valid) => {
            if (valid) {
              showLoading();
              this.formBase.roleIds =  this.userHaveRoles;
              if (this.formBase.userId){
                update(this.formBase).then(res => {
                  let resp  = res.data;
                  this.$message({message:resp.msg,type:resp.code===200?"success":"error"});
                  if(resp.code===200) {
                    hideLoading();
                    this.dialogFormVisible = false;
                    this.$refs['refForm'].resetFields();
                    this.doQuery();
                  }
                })
              }else {
                add(this.formBase).then(res => {
                  let resp  = res.data;
                  this.$message({message:resp.msg,type:resp.code===200?"success":"error"});
                  if(resp.code===200) {
                    hideLoading();
                    this.dialogFormVisible = false;
                    this.$refs['refForm'].resetFields();
                    this.doQuery();
                  }
                })
              }
            } else {
              return false;
            }
          });
          this.userHaveRoles = [];
        },

        // resetForm(formName) {
        //   this.$nextTick(() => {
        //     this.$refs[formName].resetFields();
        //   })
        // },
      },
      // 创建完毕状态
      created: function () {
        this.doQuery()
      }
    }
</script>

<style scoped>
  .el-input{
    width: 300px;
  }
  .el-select{
    width: 300px;
  }


</style>
