<template>
  <el-container style="border: 1px solid #eee">
    <el-row style="width: 100%">



      <el-col   :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
        <el-card class="box-card">
          <!--表头菜单   -->
          <div id="handButton" >
            <el-button icon="el-icon-delete" size="mini"  @click="batchDelete" ></el-button>
            <el-button type="primary" icon="fa fa-image" size="mini" @click="openSvmDialog('one')"> 上传图片</el-button>
            <el-button type="primary" icon="fa fa-folder-open" size="mini" @click="openSvmDialog('more')"> 测试集测试</el-button>
            <el-upload
              class="upload-demo inline-block margin-right-10"
              action="string" :http-request="beforeAvatarUpload" :limit="10" :show-file-list="false">
              <el-button id="uploadOneImage" type="primary" icon="fa fa-image" size="small" @click="" v-show="false">  上传图片隐藏</el-button>
            </el-upload>
          </div>
          <el-row style="padding-top: 10px;">

          </el-row>
        </el-card>

        <el-card class="tableCard" >
          <el-table :data="dataList"  style="width: 100%" border  ref="multipleTable"  >
            <el-table-column type="selection" width="40" prop="imageId"> </el-table-column>
            <el-table-column  prop="fileName"  label="文件名" > </el-table-column>
            <el-table-column prop="image" label="图片" min-width="100px" >
              <!-- 图片的显示 -->
              <template   slot-scope="scope">
                <!--            <img :src="scope.row.url"  min-width="70" height="70" />-->
                <div class="demo-image__preview">
                  <el-image
                    style="width: 100px; height: 75px"
                    :src="scope.row.url"
                    :preview-src-list=[scope.row.url]>></el-image>
                </div>
              </template>
            </el-table-column>
            <el-table-column  prop="svmInfo"  label="标签信息" > </el-table-column>
            <el-table-column  prop="label"  label="文件标签"   :formatter="labelFormatter"></el-table-column>
            <el-table-column  prop="score"  label="预测得分"   :formatter="scoreFormatter"></el-table-column>
            <el-table-column  prop="createTime"  label="时间" > </el-table-column>
            <el-table-column  prop="probability"  label="概率" > </el-table-column>
            <el-table-column  prop="classification"  label="分类预测" :formatter="formatterClass" > </el-table-column>
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
    </el-row>


    <el-dialog :title="svmTitleDialog"   :visible.sync="SvmDialog" :before-close="svmCancel" :close-on-click-modal="false" :width="'20%'">
      <!-- :model绑定表单对象  status-icon控制每一行表单校验通过后图标显示正确和错误   :rules绑定校验规则  autocomplete="off" 关闭表单默认以及功能-->
      <el-form :model="svmFormBase" status-icon   ref="svmRefForm" >
        <el-form-item label="svm文件" prop="file" >
          <el-select v-model="svmFormBase.svmVersionId"  placeholder="请选择SVM版本" size="small" @change="getSvmSelectData">
            <el-option
              v-for="item in smvData"
              :key="item.svmId"
              :label="item.name"
              :value="item.svmId">
            </el-option>
          </el-select>

          <el-form-item label="svm信息" prop="svmInfo" >
            <el-input  type="textarea" :readonly=true v-model="svmFormBase.svmInfo" autocomplete="off"   :rows="5" ></el-input>
          </el-form-item>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="svmCancel">取 消</el-button>
        <el-button type="primary" @click="chooseSvm">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog :title="titleDialog"   :visible.sync="TreeDialog" :before-close="cancel" :close-on-click-modal="false" :width="'40%'">
      <!-- :model绑定表单对象  status-icon控制每一行表单校验通过后图标显示正确和错误   :rules绑定校验规则  autocomplete="off" 关闭表单默认以及功能-->
      <el-form :model="FileFormBase" status-icon  ref="refForm" label-width="120px">
        <el-divider content-position="left">文件列表选择</el-divider>
        <!-- 权限树结构  自定义参数配置 1. node-key指定自定义的树结构ID的主键  2.:props="defaultProps 配置其他数据对象绑定
                accordion手风琴模式    show-checkbox节点显示选中框  -->
        <el-tree style="margin-top: 10px"   :data="setTree"   :props="defaultProps"  node-key="fileId"  ref="treeObject"
                 :show-checkbox="useCheck"     show-checkbox>
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
        <el-button type="primary" @click="submitTestData">确 定</el-button>
      </div>
    </el-dialog>
  </el-container>

</template>
<!--主页面板-->
<script>
  import {fileList,testSvmFile,probabilityList,svmList,deletesProbability,uploadImages} from "@/api/base/file"
  import {showLoading,hideLoading} from '@/utils/loadingUtils';
  import $ from 'jquery'
  const myToken =  localStorage.getItem('accessToken');
    export default {

      data() {
        return {
          digMsg:'',
          value: '',
          token: {'Authorization':  myToken},
          smvData: [],
          dataList: [],
          formBase: {},
          uploadData:{ svmId:""},
          FileFormBase:{},
          svmFormBase:{
            svmVersionId:"",
            svmInfo:"",
          },
          //树节点绑定
          setTree: [],  //全部后台树结构数据绑定对象
          defaultProps: {//绑定树结构映射基础参数
            label: 'title',
            children: 'children'
          },
          useCheck:false,
          TreeDialog: false,
          SvmDialog:false,
          svmTitleDialog: "SVM版本选择",
          titleDialog:"测试集测试",
          //定义表单初始化参数
          checkInfo: {
            svmVersionId:"",
            fileUrl:""
          },

          //表格分页
          total: 0,
          requestParameters: {
            page: 1,
            size: 30,
          },

        }
      },

      methods: {
        /**
         *  处理文件上传前处理
         */
        beforeAvatarUpload( file){
          let svmId =this.svmFormBase.svmVersionId.svmId;
          if (svmId ==null ||svmId<=0){
            this.$message.error("SVM文件ID错误！");
            return false
          }
          let formData = new FormData();
          formData.append('file', file.file);
          formData.append('svmId', svmId);
          uploadImages(formData)
            .then(response => {
              let res = response.data;
              if (res['code']===200){
                this.$message.success('上传成功!');
                this.doQueryProbabilityList(this.requestParameters);
              }else {
                this.$message.error(res['msg']);
              }
            }).catch((err) =>{
              console.log(err)
          })
        },

        openSvmDialog(msg){
          this.SvmDialog= true;
          this.digMsg = msg;
        },

        chooseSvm(){
          this.SvmDialog= false;
          if (this.digMsg==="more"){
            this.TreeDialog = true;
            this.doQueryFile();
          }
          else if (this.digMsg==="one"){
            $("#uploadOneImage").click()
          }
        },


        /**
         * 表单取消对话框事件
         */
        cancel() {
          this.TreeDialog = false;
          this.$refs['refForm'].resetFields();
        },

        svmCancel(){
          this.SvmDialog = false;
          this.svmFormBase.svmVersionId = "";
          this.$refs['svmRefForm'].resetFields();
          this.digMsg = '';
        },
        /*
        * 查询SVM版本列表
        */
        doQuerySvmList() {
          svmList()
            .then(res => {
              let resp = res.data;
              this.smvData = resp.data;
            })
        },

        /*
        *  查询预测结果
        */
        doQueryProbabilityList() {
          probabilityList(this.requestParameters)
            .then(res => {
              let resp = res.data;
              this.dataList = resp.data;
              this.total = resp.total;
            })
        },

        /*
        * 查询文件菜单树结构
        */
        doQueryFile() {
          fileList()
            .then(res => {
              let resp = res.data;
              this.setTree = resp.data;
            })
        },

        /*
        * 表单格式化取整
        */
        labelFormatter(row, column){
          if (row.label){
            return Math.round(row.label)
          }
          return '';
        },

        scoreFormatter(row, column){
          return Math.round(row.score);
        },

        getSvmSelectData(data){
          for (let i = 0; i<this.smvData.length; i++){
            let ob = this.smvData[i];
            if (ob.svmId === data){
              this.svmFormBase.svmInfo = ob.info;
            }
          }
        },

        /**
         * 表格格式化内容
         */
        formatterClass(row, column) {
          let name  = row['classification'];
          if (name){
            let s = name.split("//");
            if (s){
              return s[1];
            }
            return '';
          }
          return '';
        },

        /*
        * 测试集测试
        */
        submitTestData(){
          let list = this.$refs.treeObject.getCheckedNodes();
          if (list.length===0){
            this.$message.warning("请勾选操作对象！");
            return false;
          }
          if (!this.svmFormBase.svmVersionId){
            this.$message.warning("请选择SVM版本！");
            return false;
          }
          let deleteNames='',deleteIds='';
          for (let i = 0; i < list.length; i++) {
            if (list[i].url=="train" ||list[i].url=="match" ){
              continue
            }
            deleteNames += ","+list[i].url.replace(/\\/g,'//');
            deleteIds +=  ","+list[i].url.replace(/\\/g,'//');
          }
          if (deleteNames.substr(0,1)===',') {
            deleteNames=deleteNames.substr(1);
          }
          if (deleteIds.substr(0,1)===',') {
            deleteIds=deleteNames.substr(1);
          }
          this.$confirm(  `请确认选中文件夹[${ deleteNames }]`, {
            type: 'warning'
          }  ).then(() => {
            let submitInfo = {
              svmPojo: this.svmFormBase.svmVersionId,
              fileUrl:deleteNames
            };
            showLoading();
            testSvmFile(submitInfo)
              .then(res => {
                let resp = res.data;
                if (resp.code === 200) {
                  hideLoading();
                  this.$message.success('测试成功!');
                  this.doQueryProbabilityList();
                  this.TreeDialog = false;
                } else {
                  hideLoading();
                  if (resp.msg){
                    this.$message.error(resp.msg);
                  }
                }
              })
          });
          this.digMsg = '';
        },

        /**
         *  表头批量删除
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
              deleteNames = list[i].fileName;
              deleteIds = list[i].id;
            }else {
              deleteNames += ","+list[i].fileName;
              deleteIds +=  ","+list[i].id;
            }
          }
          this.$confirm(  `本次操作将删除[ ${ deleteNames } ]记录信息,删除后将不可恢复，您确认删除吗？`, {
            type: 'warning'
          }  ).then(() => {
            submitData.append("ids",deleteIds);
            showLoading();
            deletesProbability(submitData)
              .then(res => {
                let resp = res.data;
                if (resp.code === 200) {
                  this.$message.success('删除成功!');
                  this.doQueryProbabilityList(this.requestParameters);
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
         *  处理文件上传 接口消息回调
         */
        handleAvatarSuccess(res, file){
          let code = res['code'];
          if (code===200){
            this.$message.success('上传成功!');
            this.doQueryProbabilityList(this.requestParameters);
          }else {
            this.$message.error(res['msg']);
          }

        },

        /***表格分页*****/
        /*
        *改变每页显示数
        */
        handleSizeChange(val) {
          this.requestParameters.size = val;
          this.doQueryProbabilityList()
        },

        /*
        *改变当前页码数
       */
        handleCurrentChange(val) {
          this.requestParameters.page = val;
          this.doQueryProbabilityList()
        },
        /***表格分页*****/
      },
      // 创建完毕状态
      created: function () {
         this.doQuerySvmList();
         this.doQueryProbabilityList();
      }
    }
</script>

<style scoped>
  .el-input{
    width: 300px;
  }


  /*************************标签鼠标右击页面样式******************************/
  .el-menu-vertical{
    border: 3px solid rgb(84, 92, 100);
    border-radius: 10px;
    z-index: 100;
  }
  .el-menu-vertical i{
    color: #777777;
  }
  .menuItem{
    height: 40px;
    line-height: 40px;
    background-color: #545c64;
    font-size: 0.9rem;
  }
  .menuItem:hover{
    background-color: #409EFF;
  }

  .el-container .el-main .el-card .el-form .el-form-item .el-input {
    width: 300px;
  }
  .iconMenuTool{
    width: 300px;
  }

  /*************************文件上传******************************/
  .inline-block {
    display: inline-block;
  }
</style>
