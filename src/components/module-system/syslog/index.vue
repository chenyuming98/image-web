<template>

  <div>
    <el-card class="box-card">
      <!--表头菜单-->
      <div class="tableHeaderToolButtonGroup">
        <div class="tableHeaderToolButtonGroup">
          <!--搜索表单 + 表单搜索按钮   prop在表单重置时候有用！ -->
          <div id="searchForm">
            <el-form :model="requestParameters" :inline="true" status-icon  ref="searchRefForm" label-width="40px"
                     size="mini" style=" height: 45px;">
              <el-form-item label="搜索" prop="searchName">
              </el-form-item>
              <el-form-item label="" prop="username">
                <el-input v-model="requestParameters.username" placeholder="请输入操作用户" autocomplete="off"></el-input>
              </el-form-item>
              <el-form-item label="" prop="result">
                <el-select v-model="requestParameters.result" placeholder="请选择操作结果">
                  <el-option label="成功" value="成功"></el-option>
                  <el-option label="失败" value="失败"></el-option>
                </el-select>
                <el-form-item label=""  prop="ipAddr">
                  <el-input v-model="requestParameters.ipAddr" placeholder="用户ip地址" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item label=""  prop="createTime">
                  <el-date-picker v-model="formBase.createTime" type="date"  placeholder="请选择开始时间" > </el-date-picker>
                </el-form-item>
                <el-form-item label=""  prop="createTimeEnd">
                  <el-date-picker v-model="formBase.createTimeEnd" type="date"  placeholder="请选择结束时间" > </el-date-picker>
                </el-form-item>
                <el-form-item>
                  <el-button style="margin-left: 15px;" size="mini" type="primary" icon="el-icon-refresh-left" @click="resetForm('searchRefForm')">重置</el-button>
                  <el-button size="mini" type="primary" icon="el-icon-search" @click="doQuery">搜索</el-button>
                  <el-dropdown>
                <span class="el-dropdown-link">
<!--                <i class="el-icon-arrow-down el-icon&#45;&#45;right"  @click="showMoreSearch">  更多条件</i>-->
                  <el-dropdown-menu slot="dropdown">
                  </el-dropdown-menu>
                </span>
                  </el-dropdown>
                </el-form-item>
              </el-form-item>
            </el-form>
          </div>
        </div>
      </div>
    </el-card>
    <el-card class="tableCard" >
      <!--表格内容  ref绑定选中内容-->
      <el-table :data="dataList"  style="width: 100%" border  ref="multipleTable" >
        <el-table-column type="selection" width="40" prop="logId"> </el-table-column>
        <el-table-column  prop="username"  label="操作用户"  width="120"> </el-table-column>
        <el-table-column  prop="operate"  label="操作记录"  width="180"> </el-table-column>
        <el-table-column  prop="result"  label="操作结果"  width="100"> </el-table-column>
        <el-table-column  prop="ipAddr"  label="用户地址"  width="135"> </el-table-column>
        <el-table-column  prop="createTime"  label="开始时间"  width="190"> </el-table-column>
        <el-table-column  prop="url"  label="请求路径"  width="180"> </el-table-column>
        <el-table-column  prop="args"  label="请求参数"  width="180"> </el-table-column>
        <el-table-column  prop="method"  label="请求方法"  width="180"> </el-table-column>
        <el-table-column  prop="endTime"  label="结束时间"  width="190"> </el-table-column>
        <el-table-column  prop="error"  label="错误提示"  width="180"> </el-table-column>
        <el-table-column  fixed="right"  label="操作"  width="100">
          <template slot-scope="scope">
            <el-button @click="handleRowDetail(scope.row)"  type="text" style="margin-left: 16px;">详情</el-button>
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

    <el-drawer  :visible.sync="drawer" :direction="direction"
                title="详情" size="38%"    :before-close="handleClose"    >
      <!-- :model绑定表单对象  status-icon控制每一行表单校验通过后图标显示正确和错误   :rules绑定校验规则
        autocomplete="off" 关闭表单默认以及功能-->
      <el-card class="box-card">
        <div id="drawerForm">
          <el-tabs v-model="activeName" type="card" >
            <el-tab-pane label="基本日志" name="first">
              <el-form :model="formBase" status-icon  ref="refForm" label-width="120px" size="mini" >
              <el-form-item label="操作用户" prop="username" >
                <el-input v-model="formBase.username" autocomplete="off" :readonly=true ></el-input>
              </el-form-item>
              <el-form-item label="操作记录" prop="operate" >
                <el-input v-model="formBase.operate" autocomplete="off" :readonly=true></el-input>
              </el-form-item>
              <el-form-item label="操作结果" prop="result" >
                <el-input v-model="formBase.result" autocomplete="off" :readonly=true></el-input>
              </el-form-item>
              <el-form-item label="用户地址" prop="ipAddr" >
                <el-input v-model="formBase.ipAddr" autocomplete="off" :readonly=true></el-input>
              </el-form-item>
              <el-form-item label="请求路径" prop="url" >
                <el-input v-model="formBase.url" autocomplete="off" :readonly=true></el-input>
              </el-form-item>
              <el-form-item label="请求时间" prop="createTime" >
                <el-input v-model="formBase.createTime" autocomplete="off" :readonly=true></el-input>
              </el-form-item>

            </el-form>
            </el-tab-pane>
            <el-tab-pane label="详细日志" name="second">
              <el-form :model="formBase" status-icon  ref="refForm" label-width="120px" size="mini" >
                <el-form-item label="请求方法" prop="method" >
                  <el-input v-model="formBase.method" autocomplete="off" :readonly=true></el-input>
                </el-form-item>
                <el-form-item label="请求时间" prop="birthday" >
                  <el-date-picker v-model="formBase.createTime" type="date" :readonly=true style="width: 150px"> </el-date-picker>
                  <el-input v-model="formBase.endTime" ype="date" :readonly=true style="width: 150px"></el-input>
                </el-form-item>
                <el-form-item label="花费时间" prop="consumingTime" >
                  <el-input v-model="formBase.consumingTime" autocomplete="off" :readonly=true></el-input>
                </el-form-item>
                <el-form-item label="错误提示" prop="error" >
                  <el-input v-model="formBase.error" autocomplete="off" :readonly=true></el-input>
                </el-form-item>
                <el-form-item label="请求参数" prop="args" >
                  <el-input type="textarea" v-model="formBase.args" autocomplete="off"  style=" width: 300px;" ></el-input>
                </el-form-item>
                <el-form-item label="堆栈异常" prop="errorInfo" >
                  <el-input  type="textarea" v-model="formBase.errorInfo" autocomplete="off"  style=" width: 300px;" ></el-input>
                </el-form-item>
              </el-form>
            </el-tab-pane>

          </el-tabs>

        </div>
      </el-card>
    </el-drawer>
  </div>

</template>
<!--主页面板-->
<script>
  import {list,batchRemove} from "@/api/base/syslog"

  export default {

    data() {
      return {
        direction: 'rtl',
        drawer: false,
        dataList: [],
        total: 0,
        requestParameters: {
          username:'',
          result:'',
          ipAddr:'',
          createTime:'',
          createTimeEnd:'',
          page: 1,
          size: 10,
        },
        //定义弹框绑定显示状态
        dialogFormVisible: false,
        selectFormParentNameUse: false,
        formTitle : '添加',
        //定义表单初始化参数
        formBase: {
          username:"",
          operate: '',
          result: '',
          ipAddr: '',
          url:'',
          args:'',
          method:'',
          createTime: '',
          consumingTime: '',
          endTime: '',
          error: '',
          errorInfo:''
        },
        selectFormChooseId: '',
        activeName: 'first'
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
       * 表单内容重置 -这里用在重置搜索表单
       */
      resetForm(formName) {
        this.$nextTick(() => {
          this.$refs[formName].resetFields();
        })
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
       * 员工详情打开右侧抽屉，处理抽屉关闭
       */
      handleClose(done) {
        done();
        // this.$confirm('确认关闭？')
        //   .then(_ => {
        //     done();
        //   })
        //   .catch(_ => {});
      },

      /**
       * 表格行编辑
       */
      handleRowDetail(rowData){
        this.drawer = true;
        this.formBase = rowData;
      },

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
  #searchForm .el-input{
    width: 150px;
  }
  #searchForm .el-select{
    width: 150px;
  }

</style>
