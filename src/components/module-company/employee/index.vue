<template>

  <div>
    <!--表格头菜单-->
    <el-col class="tableHeaderToolButtonGroup" :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
      <el-card class="box-card">
        <!--搜索表单 + 表单搜索按钮   prop在表单重置时候有用！ -->
        <div id="searchForm">
          <el-form :model="requestParameters" :inline="true" status-icon :rules="rules" ref="searchRefForm" label-width="40px"
                   size="mini" style=" height: 45px;">
            <el-form-item label="搜索" prop="name">
            </el-form-item>
            <el-form-item label="" prop="sex">
              <el-input v-model="requestParameters.name" placeholder="员工姓名" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item label="" prop="sex">
              <el-select v-model="requestParameters.sex" placeholder="请选择性别">
                <el-option label="男" value="1"></el-option>
                <el-option label="女" value="2"></el-option>
              </el-select>
              <el-form-item label="" v-show="showMoreSearchInput" prop="number">
                <el-input v-model="requestParameters.number" placeholder="工号" autocomplete="off"></el-input>
              </el-form-item>
              <el-form-item label="" v-show="showMoreSearchInput" prop="phone">
                <el-input v-model="requestParameters.phone" maxlength="11" placeholder="手机号码" autocomplete="off"></el-input>
              </el-form-item>
<!--              <el-form-item label=""  v-show="showMoreSearchInput">-->
<!--                <el-input v-model="requestParameters.identityCard" maxlength="18" placeholder="身份证"-->
<!--                          autocomplete="off"></el-input>-->
<!--              </el-form-item>-->
              <el-form-item>
                <el-button style="margin-left: 15px;" size="mini" type="primary" icon="el-icon-refresh-left" @click="resetForm('searchRefForm')">重置</el-button>
                <el-button size="mini" type="primary" icon="el-icon-search" @click="doQuery">搜索</el-button>
                <el-dropdown>
                <span class="el-dropdown-link">
                <i class="el-icon-arrow-down el-icon--right"  @click="showMoreSearch">  更多条件</i>
                  <el-dropdown-menu slot="dropdown">
                  </el-dropdown-menu>
                </span>
                </el-dropdown>
              </el-form-item>
            </el-form-item>
          </el-form>
        </div>

        <div id="handButton" >
              <el-button icon="el-icon-plus" size="mini" @click="handleAdd">新增</el-button>
              <el-button icon="el-icon-delete" size="mini" @click="batchDelete">删除</el-button>

              <!--     :auto-upload =true 立即上传   action上传地址 limit限制文件数量 headers携带请求头 &ndash;&gt;-->
              <el-upload
                class="upload-demo inline-block margin-right-10"
                ref="upload"
                accept=".xls,.xlsx"
                action="http://www.tianyu.com/organization/employee/fileUpLoad"
                :limit="1"
                :on-success="handleAvatarSuccess"
                :headers="token"
                :auto-upload="true">
                <el-button icon="el-icon-download" size="mini" @click="">导入</el-button>
              </el-upload>
              <el-button icon="el-icon-upload2" size="mini" @click="download">导出</el-button>


        </div>
      </el-card>
    </el-col>


    <!--表格内容  ref绑定选中内容-->
    <el-col class="followInfo" :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
      <el-card class="tableCard" >
    <el-table :data="dataList"  style="width: 100%" border  ref="multipleTable"  >
          <el-table-column type="selection" width="40" prop="employeeId"> </el-table-column>
          <el-table-column  prop="name"  label="员工姓名"  > </el-table-column>
          <el-table-column  prop="number"  label="工号"  > </el-table-column>
          <!--    //TODO等待使用FASTDFS    -->
          <el-table-column  prop="images"  label="头像"  >
            <template   slot-scope="scope">
              <div class="block"><el-avatar size="small" :src="scope.row.images"></el-avatar></div>
            </template>
          </el-table-column>
          <el-table-column  prop="sex_dictText"  label="性别"  > </el-table-column>
          <el-table-column  prop="phone"  label="手机号"> </el-table-column>
          <el-table-column  prop="identityCard"  label="身份证"  sortable > </el-table-column>
<!--          <el-table-column-->
<!--            prop="userStatus"-->
<!--            label="状态">-->
<!--            <template slot-scope="scope">-->
<!--              <el-switch-->
<!--                v-model="scope.row.userStatus"-->
<!--                active-color="#13ce66"-->
<!--                :active-value= 0-->
<!--                :inactive-value=  1-->
<!--                @change="handleStatus(scope.row)">-->
<!--              </el-switch>-->
<!--            </template>-->
<!--          </el-table-column>-->
          <el-table-column  prop="birthday"  label="生日"  > </el-table-column>

          <el-table-column  fixed="right"  label="操作"  >
            <template slot-scope="scope">
              <el-button @click="handleRowEdit(scope.row)"  type="text" style="margin-left: 16px;">详情</el-button>
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
    </el-col>
      <el-drawer  :visible.sync="drawer" :direction="direction"
                  title="详情" size="38%"    :before-close="handleClose"    >
        <!-- :model绑定表单对象  status-icon控制每一行表单校验通过后图标显示正确和错误   :rules绑定校验规则
          autocomplete="off" 关闭表单默认以及功能-->
        <el-card class="box-card">
            <div id="drawerForm">
              <el-tabs v-model="activeName" type="card" >
              <el-tab-pane label="基本信息" name="first">
                <el-form :model="formBase" status-icon :rules="rules" ref="refForm" label-width="120px" size="mini">
                  <el-form-item label="员工姓名" prop="name" >
                    <el-input v-model="formBase.name" autocomplete="off"></el-input>
                  </el-form-item>
                  <el-form-item label="工号" prop="number" >
                    <el-input v-model="formBase.number" autocomplete="off"></el-input>
                  </el-form-item>
                  <el-form-item label="手机号码" prop="phone" >
                    <el-input v-model="formBase.phone" maxlength="11" autocomplete="off"></el-input>
                  </el-form-item>
                  <el-form-item label="身份证" prop="identityCard" >
                    <el-input v-model="formBase.identityCard" maxlength="18" autocomplete="off"></el-input>
                  </el-form-item>
                  <el-form-item label="性别" prop="sex" >
                    <el-radio-group v-model="formBase.sex"  >
                      <el-radio label="1" >男</el-radio>
                      <el-radio label="2" >女</el-radio>
                    </el-radio-group>
                  </el-form-item>
                  <el-form-item label="邮箱" prop="mailbox" >
                    <el-input v-model="formBase.mailbox" autocomplete="off"></el-input>
                  </el-form-item>
                  <el-form-item label="生日" prop="birthday" >
                    <el-date-picker v-model="formBase.birthday" type="date"  placeholder="选择日期" > </el-date-picker>
                  </el-form-item>
                  <el-form-item label="地址" prop="address" >
                    <el-input v-model="formBase.address" autocomplete="off"></el-input>
                  </el-form-item>
                  <el-form-item label="更新时间" prop="updateTime" >
                    <el-input v-model="formBase.updateTime" autocomplete="off" readonly></el-input>
                  </el-form-item>
                </el-form>
              </el-tab-pane>
              <el-tab-pane label="部门职位" name="second">

                <div>
                  <el-button icon="el-icon-delete" size="mini" @click="handleClearJob" style="margin-left: 430px;"></el-button>
                  <el-form :model="formJob" status-icon  ref="refJobForm" label-width="120px" style="" size="mini">
                    <el-form-item label="所属公司" prop="dept" >
                      <el-select :value="valueTitle" :clearable="clearable" @clear="clearHandle">
                        <el-option :value="valueTitle" :label="valueTitle">
                          <el-tree  id="tree-option"
                                    ref="selectTree"
                                    :accordion="accordion"
                                    :data="setTree"
                                    :props="props"
                                    :node-key="props.value"
                                    :default-expanded-keys="defaultExpandedKey"
                                    @node-click="handleNodeClick">
                          </el-tree>
                        </el-option>
                      </el-select>
                    </el-form-item>
                    <el-form-item label="工作-等级" prop="job" >

                      <el-select v-model="formJob.jobId" placeholder="请选择工作职位" style="width: 150px">
                        <el-option
                          v-for="item in jobList"
                          :key="item.dictionaryId"
                          :label="item.dictionaryName"
                          :value="item.dictionaryId">
                        </el-option>
                      </el-select>
                      <el-select v-model="formJob.gradeId" placeholder="请选择工作等级" style="width: 150px">
                        <el-option
                          v-for="item in gradeList"
                          :key="item.dictionaryId"
                          :label="item.dictionaryName"
                          :value="item.dictionaryId">
                        </el-option>
                      </el-select>

                    </el-form-item>
                    <el-form-item label="入职-离职" prop="time" >
                      <el-date-picker v-model="formJob.joinTime" type="date"  placeholder="选择入职日期"   style="width: 150px"> </el-date-picker>
                      <el-date-picker v-model="formJob.endTime" type="date"  placeholder="选择离职日期"   style="width: 150px"> </el-date-picker>
                    </el-form-item>
                  </el-form>
                </div>
<!--                <el-divider></el-divider>-->

              </el-tab-pane>
              </el-tabs>
              <!--    表单按钮   -->
              <div slot="footer" class="dialog-footer" style="position:absolute;right:5px;bottom:5px;">
                <el-button  size="mini" @click="cancel">取 消</el-button>
                <el-button  size="mini" type="primary" @click="submitForm">确 定</el-button>
              </div>
            </div>
        </el-card>
      </el-drawer>
  </div>

</template>
<!--主页面板-->
<script>
  import {list,add,update,remove,batchRemove,clearEmployeeJobs,exportFile,code} from "@/api/base/employee"
  import {showLoading,hideLoading} from '@/utils/loadingUtils';
  import {getTreeList} from "@/api/base/company";

  const  multipleSelectionList =  new Set([]);
  const myToken =  localStorage.getItem('accessToken');
    export default {

      props:{
        /* 配置项 */
        props:{
          type: Object,
          default:()=>{
            return {
              value:'deptId',             // ID字段名
              label: 'name',       // 显示名称
              children: 'children'    // 子级字段名
            }
          }
        },

        /* 初始值 */
        value:{
          type: String,
          default: ()=>{ return null }
        },
        /* 可清空选项 */
        clearable:{
          type:Boolean,
          default:()=>{ return true }
        },
        /* 自动收起 */
        accordion:{
          type:Boolean,
          default:()=>{ return false }
        },
      },
      data() {
        return {
          valueId:this.value,    // 初始值
          valueTitle:'',
          defaultExpandedKey:[],
          deptModule:'deptModule',
          showDept:false,
          token: {'Authorization':  myToken},
          showMoreSearchInput: false,
          drawer: false,
          direction: 'rtl',
          userAdd: 'UserAdd',
          dataList: [],
          multipleSelection: multipleSelectionList,
          total: 0,
          employeeJobs: [],
          requestParameters: {
            page: 1,
            size: 10,
            number: undefined,
            name: undefined,
            sex: undefined,
            phone:undefined,
            identityCard: undefined,
          },
          defaultProps: {//绑定树结构映射基础参数
            label: 'name',
            children: 'children'
          },
          setTree: [],  //全部后台树结构数据绑定对象
          //定义弹框绑定显示状态
          dialogFormVisible: false,
          formTitle : '添加',
          //定义表单初始化参数
          formBase: {
            employeeId:"",
            number: '',
            name: '',
            sex: '',
            phone:'',
            mailbox:'',
            birthdayFormat:'',
            identityCard: '',
            address: '',
            createTime: '',
            updateTime: '',
            birthday:'',
            employeeJobList:[]
          },
          //条件搜索
          searchForm:{
            number: '',
            name: '',
            sex: '',
            phone:'',
            identityCard: '',
          },
          activeName: 'first',
          //v-model 绑定校验规则
          rules: {
            // name: [
            //   {required: true, message: '请输入员工姓名', trigger: 'blur'},
            //   {min: 6, max: 11, message: '员工姓名长度在 6 到 11 个字符', trigger: 'blur'}
            // ],
            // userPassword: [{required: true, message: '请输入密码', trigger: 'blur'},
            //   {min: 6, max: 16, message: '密码长度在 6 到 16个字符', trigger: 'blur'}]
          },
          formJob:{
            dbKey:'',
            employeeId:'',
            deptId:'',
            jobId:'',
            gradeId:'',
            joinTime:'',
            endTime:'',
          },
          jobList: [],
          gradeList: [ ],
        }
      },

      methods: {

        /*
        * 查询员工表格
        */
        doQuery(params) {
          showLoading();
          list(this.requestParameters)
            .then(res => {
              let resp = res.data;
              this.dataList = resp.data;
              this.total = resp.total;
              hideLoading();
            })
        },

        /*
        * 查询职称列表
        */
        doGradeListQuery(params) {
          let search = { "code":"grade"};
          code(search)
            .then(res => {
              let resp = res.data;
              this.gradeList = resp.data;
            })
        },

        /*
        * 查询工作列表
        */
        doJobListQuery(params) {
          let search = { "code":"job"};
          code(search)
            .then(res => {
              let resp = res.data;
              this.jobList = resp.data;
            })
        },


        /*
        * 查询部门菜单树结构
        */
        doDeptQuery(chooseId) {
          getTreeList()
            .then(res => {
              let resp = res.data;
              this.setTree = resp.data;
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
         * 添加新员工
         */
        handleAdd() {
          this.clearJobForm();
          this.drawer = true;
          this.activeName = 'first';
          this.formBase = { "sex": "1"};
          this.doGradeListQuery();
          this.doJobListQuery();
          this.doDeptQuery();
        },

        /**
         * 表格行编辑
         */
        handleRowEdit(rowData){
          // this.clearJobForm();
          this.doGradeListQuery();
          this.doJobListQuery();
          this.doDeptQuery();
          this.drawer = true;
          this.activeName = 'first';
          this.formBase = rowData;
          let eDeptId = rowData['employeeJobList'][0]['deptId'];
          let eDeptName = rowData['employeeJobList'][0]['deptName'];
          this.valueTitle =  eDeptName;
          this.valueId =  eDeptId;
          this.formJob = rowData['employeeJobList'][0];
        },

        /**
         * 表格行删除员工
         */
        handleRowDelete(rowData) {
          this.$confirm(
            `本次操作将删除[ ${rowData.name} ]删除后员工将不可恢复，您确认删除吗？`, {
              type: 'warning'
            }
          ).then(() => {
            remove({id: rowData.employeeId})
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
              deleteNames = list[i].name;
              deleteIds = list[i].employeeId;
            }else {
              deleteNames += ","+list[i].name;
              deleteIds +=  ","+list[i].employeeId;
            }
          }
          this.$confirm(  `本次操作将删除[ ${ deleteNames } ],删除后员工将不可恢复，您确认删除吗？`, {
              type: 'warning'
            }  ).then(() => {
            submitData.append("ids",deleteIds);
            showLoading();
            batchRemove(submitData)
              .then(res => {
                let resp = res.data;
                if (resp.code === 200) {
                  this.$message.success('删除成功!');
                  this.doQuery();
                  hideLoading();
                } else {
                  hideLoading();
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
          this.clearJobForm();
          this.drawer =false
        },

        /**
         * 提交表单
         */
        submitForm(){
          this.$refs['refForm'].validate((valid) => {
            if (valid) {
              showLoading();
              this.formBase.employeeJobList = [];
              this.formJob.employeeId =  this.formBase.employeeId;
              this.formBase.employeeJobList.push(this.formJob);
              // this.formBase.createTime =undefined;
              // this.formBase.updateTime =undefined;
              if (this.formBase.employeeId){
                update(this.formBase).then(res => {
                  let resp  = res.data;
                  this.$message({message:resp.msg,type:resp.code===200?"success":"error"});
                  if(resp.code===200) {
                    this.drawer =false;
                    this.$refs['refForm'].resetFields();
                    this.$refs['refJobForm'].resetFields();
                    this.doQuery();
                    this.clearJobForm();
                    hideLoading();
                  }
                })
              }else {
                add(this.formBase).then(res => {
                  let resp  = res.data;
                  this.$message({message:resp.msg,type:resp.code===200?"success":"error"});
                  if(resp.code===200) {
                    this.drawer =false;
                    this.$refs['refForm'].resetFields();
                    this.clearJobForm();
                    this.doQuery();
                    hideLoading();
                  }
                })
              }
            } else {
              return false;
            }
          });
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
         * 表单内容重置 -这里用在重置搜索表单
         */
        resetForm(formName) {
          this[formName] = {};
          this.$nextTick(() => {
            this.$refs[formName].resetFields();
          })
        },

        clearJobForm(){
          this.clearHandle();
          this.formBase.employeeId = '';
          this.formBase.deptId = '';
          this.formJob ={
            employeeId:'',
            deptId:'',
            jobId:'',
            gradeId:'',
            joinTime:'',
            endTime:'',
          }
        },

        /**
         * 控制表格头 菜单搜索条件显示
         */
        showMoreSearch(){
          this.showMoreSearchInput = !this.showMoreSearchInput;
        },
        // 下载Excel
        download() {
          exportFile().then(response => {
            this.downloadFile(response.data);
          })
        },

        downloadFile(data) {
          // 文件导出
          if (!data) {
            return
          }
          let url = window.URL.createObjectURL(new Blob([data]));
          let link = document.createElement('a');
          link.style.display = 'none';
          link.href = url;
          link.setAttribute('download', '员工信息表.xls');
          document.body.appendChild(link);
          link.click()
        },

        /**
         *  处理文件上传 接口消息回调
         */
        handleAvatarSuccess(res, file){
          let code = res['code'];
          if (code===200){
            this.$message.success('上传成功!');
            this.doQuery();
          }else {
            this.$message.error(res['msg']);
          }

        },


        // 初始化值
        initHandle(){
          if(this.valueId){
            this.valueTitle = this.$refs.selectTree.getNode(this.valueId).data[this.props.label]     // 初始化显示
            this.$refs.selectTree.setCurrentKey(this.valueId)       // 设置默认选中
            this.defaultExpandedKey = [this.valueId]      // 设置默认展开
          }
          this.$nextTick(()=>{
            let scrollWrap = document.querySelectorAll('.el-scrollbar .el-select-dropdown__wrap')[0]
            let scrollBar = document.querySelectorAll('.el-scrollbar .el-scrollbar__bar')
            scrollWrap.style.cssText = 'margin: 0px; max-height: none; overflow: hidden;'
            scrollBar.forEach(ele => ele.style.width = 0)
          })

        },

        // 选中所属公司
        handleNodeClick(node){
          this.formJob.deptId = node.companyId;
          this.valueTitle = node[this.props.label]
          this.valueId = node[this.props.value]
          this.$emit('getValue',this.valueId)
          this.defaultExpandedKey = []
        },
        // 清除选中
        clearHandle(){
          this.valueTitle = '';
          this.valueId = null;
          this.defaultExpandedKey = [];
          this.clearSelected();
          this.$emit('getValue',null)
        },
        /* 清空选中样式 */
        clearSelected(){
          let allNode = document.querySelectorAll('#tree-option .el-tree-node')
          allNode.forEach((element)=>element.classList.remove('is-current'))
        },

        // 清除工作
        handleClearJob(){
          console.log("coming")
          let dbKey =  this.formJob.dbKey;
          let submitData = [ {'dbKey':dbKey }]
          this.$confirm(  `本次操作将清除员工的职位？`, {
            type: 'warning'
          }  ).then(() => {
            showLoading();
            clearEmployeeJobs(submitData)
              .then(res => {
                let resp = res.data;
                if (resp.code === 200) {
                  this.$message.success('清除成功!');
                  this.formJob ={
                    employeeId:'',
                    deptId:'',
                    jobId:'',
                    gradeId:'',
                    joinTime:'',
                    endTime:'',
                  }
                  this.valueTitle = "";
                  hideLoading();
                } else {
                  hideLoading();
                  this.$message.error(resp.msg);
                }
              })
          }).catch(() => {
          });
        }
      },
      mounted(){
        this.initHandle()
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
  #searchForm .el-input{
    width: 150px;
  }
  #searchForm .el-select{
    width: 150px;
  }
  .el-select{
    width: 300px;
  }
  #drawerForm {
    margin-top: 10px;
  }
  /deep/.el-table th > .cell {
    text-align: center;
  }
  /deep/.el-table .cell {
    text-align: center;
  }

  .el-dropdown-link {
    cursor: pointer;
    color: #409EFF;
  }
  .el-icon-arrow-down {
    font-size: 12px;
  }
  /*.el-scrollbar .el-scrollbar__view .el-select-dropdown__item{*/
  /*  height: auto;*/
  /*  max-height: 274px;*/
  /*  padding: 0;*/
  /*  overflow: hidden;*/
  /*  overflow-y: auto;*/
  /*}*/
  .el-scrollbar .el-scrollbar__view .el-select-dropdown__item{
    height: auto;
    max-height: 274px;
  }
  .el-select-dropdown__item.selected{
    font-weight: normal;
  }
  ul li >>>.el-tree .el-tree-node__content{
    height:auto;
    padding: 0 20px;
  }
  .el-tree-node__label{
    font-weight: normal;
  }
  .el-tree >>>.is-current .el-tree-node__label{
    color: #409EFF;
    font-weight: 700;
  }
  .el-tree >>>.is-current .el-tree-node__children .el-tree-node__label{
    color:#606266;
    font-weight: normal;
  }
  .inline-block {
    display: inline-block;
  }
</style>
