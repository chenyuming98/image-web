<template>

  <div>
    <el-card class="box-card">
      <!--表头菜单-->
      <div class="tableHeaderToolButtonGroup">
        <el-button icon="el-icon-plus" size="mini"  @click="handleAdd()" ></el-button>
        <el-button  icon="el-icon-delete" size="mini"   @click="batchDelete" ></el-button>
      </div>
    </el-card>
    <el-card class="tableCard" >
      <!--表格内容  ref绑定选中内容-->
      <el-table :data="dataList"  style="width: 100%" border  ref="multipleTable"  row-key="dictionaryId">
        <el-table-column type="selection" width="40" prop="dictionaryId"> </el-table-column>
        <el-table-column  prop="dictionaryName"  label="字典名称"  />
        <el-table-column  prop="dictionaryCode"  label="字典编码"  />
        <el-table-column  prop="dictionaryValue"  label="字典参数"  />
        <el-table-column  prop="systemCode"  label="系统内置"     :formatter="formatterSystemCode" />
        <el-table-column  prop="dictionaryInfo"  label="描述"  />
        <el-table-column  fixed="right"  label="操作"  >
          <template slot-scope="scope">
            <template v-if="scope.row.isOneMenuInfo">
              <el-button @click="handleAdd(scope.row)"   type="text" size="small">添加</el-button>
            </template>

                <!--  TODO 正式系统开启上方-->
<!--            <template v-if="scope.row.isEdit">-->
<!--              <el-button @click="handleRowEdit(scope.row)"   type="text" size="small">编辑</el-button>-->
<!--              <el-button @click="batchDelete(scope.row)" type="text" size="small">删除</el-button>-->
<!--            </template>-->

            <el-button @click="handleRowEdit(scope.row)"   type="text" size="small">编辑</el-button>
            <el-button @click="batchDelete(scope.row)" type="text" size="small">删除</el-button>
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
      <el-form :model="formBase" status-icon  ref="refForm" label-width="120px">
        <el-form-item label="字典名称" prop="dictionaryName" >
          <el-input v-model="formBase.dictionaryName" autocomplete="off"></el-input>
        </el-form-item>

        <el-form-item label="父级" prop="selectFormChooseId" >
            <el-select v-model="selectFormChooseId" filterable placeholder="请选择"  allow-create :disabled="selectFormParentNameUse">
              <el-option   v-for="item in allParentDataList"   :key="item.dictionaryId"    :label="item.dictionaryName"   :value="item.dictionaryId">
              </el-option>
            </el-select>
          </el-form-item>

        <el-form-item label="字典编码" prop="dictionaryCode" >
          <el-input v-model="formBase.dictionaryCode" autocomplete="off" :disabled="disabledCode"></el-input>
        </el-form-item>

        <el-form-item label="字典参数" prop="dictionaryValue" >
          <el-input v-model="formBase.dictionaryValue" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="描述" prop="dictionaryInfo" >
          <el-input type="textarea" v-model="formBase.dictionaryInfo" autocomplete="off" style="width: 300px"></el-input>
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
  import {list,add,update,remove,batchRemove,allParentList} from "@/api/base/dictionary.js"

  export default {

    data() {
      return {

        dataList: [],
        total: 0,
        requestParameters: {
          page: 1,
          size: 10,
        },
        userHaveRoles: [],
        rolesData: [],

        //定义弹框绑定显示状态
        dialogFormVisible: false,
        selectFormParentNameUse: false,
        disabledCode: false,
        formTitle : '添加',
        //定义表单初始化参数
        formBase: {
          dictionaryId: '',
          dictionaryName: '',
          dictionaryParentId: '',
          dictionaryCode: '',
          dictionaryValue: '',
          dictionaryInfo: '',
        },
        allParentDataList: [],
        selectFormChooseId: '',
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
       * 添加新字典
       */
      handleAdd(rowData) {
        this.doQueryAllParentList(); //加载父级下拉框
        if (rowData && rowData.dictionaryParentId){
          this.selectFormChooseId = rowData.dictionaryId;
          this.selectFormParentNameUse = true;
          this.disabledCode =false;
        }else {
          this.selectFormChooseId = "0";
          this.selectFormParentNameUse = false;
          this.disabledCode =false;
          this.formBase ={
              dictionaryId: '',
              dictionaryName: '',
              dictionaryParentId: '',
              dictionaryCode: '',
              dictionaryValue: '',
              dictionaryInfo: '',
          }
        }
        if (rowData){
          this.formBase = {
            dictionaryCode: rowData['dictionaryCode'],
          };
        }
        this.formTitle = "添加";
        this.dialogFormVisible = true
      },

      /**
       * 表格行编辑
       */
      handleRowEdit(rowData){
        this.doQueryAllParentList(); //加载父级下拉框
        if (rowData.dictionaryParentId ==="0"){
          this.selectFormChooseId = rowData.dictionaryParentId;
          this.selectFormParentNameUse = true;
          this.disabledCode = false;
        }else {
          this.selectFormChooseId = rowData.dictionaryId;
          this.selectFormParentNameUse = true;
          this.disabledCode = true;
        }
        this.formTitle = "编辑";
        if (rowData.dictionaryParentId !=="0"){
          this.selectFormChooseId = rowData.dictionaryParentId;
        }
        this.formBase = {
          dictionaryId: rowData.dictionaryId,
          dictionaryName: rowData.dictionaryName,
          dictionaryParentId: rowData.dictionaryParentId,
          dictionaryCode: rowData.dictionaryCode,
          dictionaryValue: rowData.dictionaryValue,
          dictionaryInfo: rowData.dictionaryInfo,
        };
        this.dialogFormVisible = true;
      },

      /**
       * 表格行删除字典
       */
      handleRowDelete(rowData) {
        this.$confirm(
          `本次操作将删除[ ${rowData.dictionaryName} ]删除后将不可恢复，您确认删除吗？`, {
            type: 'warning'
          }
        ).then(() => {
          remove({id: rowData.dictionaryId})
            .then(res => {
              let resp = res.data;
              if (resp.code === 200) {
                this.$message.success('删除成功!');
                this.doQuery();
              } else {
                this.$message.success(resp.msg);
              }
            })
        })
      },

      /**
       *  批量删除字典
       */
      batchDelete(rowData) {
        let deleteNames='',deleteIds='',notDeleteNames='';
        let submitData = new FormData();
        if (rowData['dictionaryId']){
          debugger
          if (rowData['systemCode']===1){
            notDeleteNames = rowData.dictionaryName;
          }else {
            deleteNames = rowData.dictionaryName;
            deleteIds  = rowData.dictionaryId;
          }
        }else {
          let list = this.$refs.multipleTable.selection;
          if (list.length===0){
            this.$message.warning("请勾选操作对象！");
            return false;
          }
          for (let i = 0; i < list.length; i++) {
              if ( list[i].systemCode ===1){
                if (notDeleteNames){
                  notDeleteNames += ","+list[i].dictionaryName;
                }else {
                  notDeleteNames = list[i].dictionaryName;
                }
                continue;
              }
              deleteNames += ","+list[i].dictionaryName;
              deleteIds +=  ","+list[i].dictionaryId;

          }
        }
        if (deleteNames.substr(0,1)===','){
          deleteNames=deleteNames.substr(1);
        }
        if (deleteIds.substr(0,1)===','){
          deleteIds=deleteIds.substr(1);
        }
        if (notDeleteNames){ this.$message.error( "系统参数[ "+ notDeleteNames +" ]禁止删除"); }
        if (deleteIds === ''){
          return false;
        }
        this.$confirm(  `本次操作将删除[ ${ deleteNames } ],删除后将不可恢复，您确认删除吗？`, {
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
            this.formBase.dictionaryParentId = this.selectFormChooseId;
            if (this.formBase.dictionaryId){
              update(this.formBase).then(res => {
                let resp  = res.data;
                this.$message({message:resp.msg,type:resp.code===200?"success":"error"});
                if(resp.code===200) {
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

      /*
    * 查询所有角色
    */
      doQueryAllParentList() {
        allParentList()
          .then(res => {
            let resp = res.data;
            this.allParentDataList = resp.data;
          })
      },

      /**
       * 表格格式化内容
       */
      formatterSystemCode(row, column) {
        let systemCode = row['systemCode'];
        if (systemCode===1){
          return "是";
        }else {
          return "否";
        }

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
