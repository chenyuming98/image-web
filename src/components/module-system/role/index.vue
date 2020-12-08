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
        <el-table-column type="selection" width="40" prop="roleId"> </el-table-column>
        <el-table-column  prop="roleName"  label="角色名称" > </el-table-column>
        <el-table-column  prop="roleCode"  label="角色编码" > </el-table-column>
        <el-table-column  prop="description"  label="描述"  > </el-table-column>

        <el-table-column  fixed="right"  label="操作"  >
          <template slot-scope="scope">
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
    <el-dialog :title="formTitle"   :visible.sync="dialogFormVisible" :before-close="cancel" :close-on-click-modal="false" :width="'40%'">
      <!-- :model绑定表单对象  status-icon控制每一行表单校验通过后图标显示正确和错误   :rules绑定校验规则  autocomplete="off" 关闭表单默认以及功能-->
      <el-form :model="formBase" status-icon :rules="rules" ref="refForm" label-width="120px">
        <el-form-item label="角色名称" prop="roleName" >
          <el-input v-model="formBase.roleName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="角色编码" prop="roleCode" >
          <el-input v-model="formBase.roleCode" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="描述" prop="description" >
          <el-input v-model="formBase.description" autocomplete="off"></el-input>
        </el-form-item>

        <el-divider content-position="left">权限分配</el-divider>
        <!-- 权限树结构  自定义参数配置 1. node-key指定自定义的树结构ID的主键  2.:props="defaultProps 配置其他数据对象绑定
                accordion手风琴模式    show-checkbox节点显示选中框  -->
        <el-tree style="margin-top: 10px;padding-left: 50px;width: 300px;"  :data="setRoleTree"   :props="defaultProps"  node-key="permissionId"  ref="SlotRoleMenuList"
                 accordion   show-checkbox   :default-checked-keys="roleHavePermList">
          <span class="slot-t-node" slot-scope="{ node, data }">
             <span >
              <i :class="data.icon"></i>
              <span :class="[data.id ? 'slot-t-node--label' : '']">{{node.label}}</span>
            </span>
        </span>
        </el-tree>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancel">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="resetForm('refForm')">重置</el-button>
      </div>
    </el-dialog>
  </div>

</template>
<!--主页面板-->
<script>
  import { getMenuList} from "@/api/base/permission";
  import {list,add,update,remove,batchRemove,findRoleHavePerms,assignRolePerms} from "@/api/base/role";
  import {api} from '@/utils/request';
  const  multipleSelectionList =  new Set([]);
    export default {

      data() {
        return {
          roleAdd: 'UserAdd',
          dataList: [],
          multipleSelection: multipleSelectionList,
          total: 0,
          requestParameters: {
            page: 1,
            size: 10,
          },
          defaultProps: {//绑定树结构映射基础参数
            label: 'title',
            children: 'children'
          },
          //定义弹框绑定显示状态
          dialogFormVisible: false,
          formTitle : '添加',
          showTree : false,
          setRoleTree:[],
          roleHavePermList:[], //角色拥有的权限
          //定义表单初始化参数
          formBase: {
            roleId: '',
            roleName: '',
            roleCode: '',
            description: '',
            permissions: [],
          },
          //v-model 绑定校验规则
          rules: {
            roleName: [
              {required: true, message: '请输入角色名称', trigger: 'blur'},
              {min: 2, max: 11, message: '角色名称长度在 2 到 11 个字符', trigger: 'blur'}
            ],
          },
        }
      },

      methods: {

        /*
        * 查询表格
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
        * 加载权限树结构 用于提供角色选取权限
        */
        doQueryMenuList() {
          getMenuList( )
            .then(res => {
              let resp = res.data;
              this.setRoleTree = resp.data;
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
         * 添加新角色
         */
        handleAdd() {
          this.doQueryMenuList();
          this.$nextTick(() => {
            this.$refs.SlotRoleMenuList.setCheckedKeys([]);
          });
          this.formBase = {
            formRoleId: '',
            roleName: '',
            description: '',
            permission: [],
          };
          this.formTitle = "添加";
          this.dialogFormVisible = true
        },

        /**
         * 编辑角色 表格行
         */
        handleRowEdit(rowData){
          this.formTitle = "编辑";
          this.doQueryMenuList();
          let chooseList = [];
          //从角色行数据中获取拥有权限列表，循环遍历获取权限key
          for (let i = 0; i < rowData.permissions.length; i++) {
            chooseList.push(rowData.permissions[i].permissionId);
          }
          //$nextTick() vue 存在dom没渲染好 这时候调用elementUI对象会出错undefined
          this.$nextTick(() => {
            this.$refs.SlotRoleMenuList.setCheckedKeys(chooseList);
          });
          //表单赋值
          this.formBase = {
            roleId: rowData.roleId,
            roleName: rowData.roleName,
            roleCode: rowData.roleCode,
            description: rowData.description,
          };
          this.dialogFormVisible = true;
        },

        /**
         * 提交表单
         */
        submitForm(){
          this.$refs['refForm'].validate((valid) => {
            if (valid) {
              // getCheckedNodes()获取树对象选中值
              this.formBase.permissions = this.$refs.SlotRoleMenuList.getCheckedNodes();
              if (this.formBase.roleId){
                update(this.formBase).then(res => {
                  let resp  = res.data;
                  this.$message({message:resp.msg,type:resp.code===200?"success":"error"});
                  if(resp.code===200) {
                    this.dialogFormVisible = false;
                    this.$refs['refForm'].resetFields();
                    this.doQuery();
                  }
                });
              }else {
                add(this.formBase).then(res => {
                  let resp  = res.data;
                  this.$message({message:resp.msg,type:resp.code===200?"success":"error"});
                  if(resp.code===200) {
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

        },

        /**
         * 表格行删除角色
         */
        handleRowDelete(rowData) {
          this.$confirm(
            `本次操作将删除[ ${rowData.roleName} ]删除后角色将不可恢复，您确认删除吗？`, {
              type: 'warning'
            }
          ).then(() => {
            remove({id: rowData.roleId})
              .then(res => {
                let resp = res.data;
                if (resp.code === 200) {
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
         *  表头批量删除角色
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
              deleteNames = list[i].roleName;
              deleteIds = list[i].roleId;
            }else {
              deleteNames += ","+list[i].roleName;
              deleteIds +=  ","+list[i].roleId;
            }
          }
          this.$confirm(  `本次操作将删除[ ${ deleteNames } ],删除后角色将不可恢复，您确认删除吗？`, {
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
          this.$refs['refForm'].resetFields();
        },

        resetForm() {
          this.$nextTick(() => {
            this.$refs['refForm'].resetFields();
          })
        },
      },
      // 创建完毕状态
      created: function () {
        this.doQuery();
      }
    }
</script>

<style scoped>
  .el-input{
    width: 300px;
  }
</style>
