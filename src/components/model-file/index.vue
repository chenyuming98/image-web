<template>
  <el-container style="border: 1px solid #eee">
    <el-row style="width: 100%">
      <el-col :xs="3" :sm="3" :md="3" :lg="7" :xl="5" class="aside">
        <el-card class="box-card" style="   width: 300px;  height: 552px;">
          <el-row style=" padding-bottom: 7px;">
            <el-upload
              class="upload-demo inline-block margin-right-10"
              ref="upload"
              accept=".zip"
              action="http://www.image.com/image/uploadZip"
              :limit="10"
              :on-success="handleAvatarSuccess"
              :before-upload="beforeAvatarUpload"
              :headers="token"
              :data = uploadData
              :show-file-list = false
              :auto-upload="true">
              <el-button type="primary" icon="el-icon-download" size="small" @click="">导入图片集</el-button>
           </el-upload>
            <el-dropdown @command="handleCommand" style="  margin-left: 10px;   border-left-width: 1px; ">
              <el-button   size="small">
                更多菜单<i class="el-icon-arrow-down el-icon--right"  @click.stop></i>
              </el-button>
              <el-dropdown-menu slot="dropdown" style="  margin-left: 18px;   border-left-width: 2px; ">
                <el-dropdown-item command="changCheckStatus">复选框</el-dropdown-item>
                <el-dropdown-item command="notChooseAll">全部取消</el-dropdown-item>
                <el-dropdown-item command="expandAll">展开所有</el-dropdown-item>
                <el-dropdown-item command="trainFile">训练svm</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </el-row>

          <template v-if="this.currentNodeData">
            <el-tag  style=" width: 250px; ">
              当前操作文件夹： {{ this.currentNodeData.title}}  <i class="el-icon-info" style="margin-left: 30px;" @click="cancelChooseNode">  取消</i>
            </el-tag>
          </template>

          <template v-else>
            <el-tag  style=" width: 250px; ">当前操作文件夹： 请选择 </el-tag>
          </template>
          <!-- 权限树结构  自定义参数配置 1. node-key指定自定义的树结构ID的主键  2.:props="defaultProps 配置其他数据对象绑定 -->
          <el-tree style="margin-top: 10px"   :data="setTree"   :props="defaultProps"  node-key="fileId"  ref="treeObject"
                   :show-checkbox="useCheck"    @node-contextmenu='rightClick'
                   @node-click="nodeClick"  >
               <span class="slot-t-node" slot-scope="{ node, data }">
               <span >
                <i :class="data.icon"></i>
                <span :class="[data.id ? 'slot-t-node--label' : '']">{{node.label}}</span>
              </span>
          </span>
          </el-tree>
          <div v-show="menuVisible" >
            <el-menu  id = "rightClickMenu"  class="el-menu-vertical"   @select="handleRightSelect"   active-text-color="#fff"  text-color="#fff" >
              <el-menu-item index="1" class="menuItem">
                <span slot="title">删除当前文件夹</span>
              </el-menu-item>
            </el-menu>
          </div>
        </el-card>
      </el-col>

      <el-col   :xs="19" :sm="19" :md="19" :lg="17" :xl="19">
        <el-card class="box-card">
          <!--表头菜单-->
          <div class="tableHeaderToolButtonGroup">
            <!--        <el-button icon="el-icon-plus" size="mini"  @click="handleAdd" ></el-button>-->
                    <el-button  icon="el-icon-delete" size="mini"   @click="batchDelete" ></el-button>
            <!--     :auto-upload =true 立即上传   action上传地址 limit限制文件数量 headers携带请求头 &ndash;&gt;-->

          </div>
        </el-card>
        <el-card class="tableCard" >
          <!--表格内容  ref绑定选中内容-->
          <el-table :data="dataList"  style="width: 100%" border  ref="multipleTable" >
            <el-table-column type="selection" width="40" prop="userId"> </el-table-column>
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
            <el-table-column prop="fileSize" label="文件大小" :formatter="formatterFileSize">
            </el-table-column>
            <el-table-column  fixed="right"  label="操作" >
              <template slot-scope="scope">
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
    </el-row>
    <el-dialog :title="chooseTitleParamDialog"   :visible.sync="chooseParamDialog"
               :before-close="paramCancel" :close-on-click-modal="false" :width="'50%'">

      <!-- :model绑定表单对象  status-icon控制每一行表单校验通过后图标显示正确和错误   :rules绑定校验规则  autocomplete="off" 关闭表单默认以及功能-->
      <el-form :model="paramFormBase" status-icon   ref="svmRefForm"  size="mini" :inline="true" class="demo-form-inline">
        <el-divider content-position="left" class="lab-class">SVM配置</el-divider>
        <el-form-item label="类型" prop="svmType" >
          <el-select v-model="paramFormBase.svmType" placeholder="类型" style="width: 150px">
            <el-option
              v-for="item in svmTypeList"
              :key="item.dictionaryId"
              :label="item.dictionaryName"
              :value="item.dictionaryValue">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="内核" prop="svmKernel" >
          <el-select v-model="paramFormBase.svmKernel" placeholder="内核" style="width: 150px">
            <el-option
              v-for="item in svmKernelList"
              :key="item.dictionaryId"
              :label="item.dictionaryName"
              :value="item.dictionaryValue">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="惩罚因子"  prop="svmC">
          <el-input v-model="paramFormBase.svmC" placeholder="惩罚因子" autocomplete="off"></el-input>
        </el-form-item>
        <el-divider content-position="left" class="lab-class">HOG配置</el-divider>
        <el-form-item label="图片归一化"  prop="winSizeX">
          <el-input type="age" v-model="paramFormBase.winSizeX" placeholder="X" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label=""  prop="winSizeY">
          <el-input v-model="paramFormBase.winSizeY" placeholder="Y" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="每个块大小"  prop="blockSizeX">
          <el-input v-model="paramFormBase.blockSizeX" placeholder="X" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label=""  prop="blockSizeY">
          <el-input v-model="paramFormBase.blockSizeY" placeholder="Y" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="块滑动增量"  prop="blockStrideSizeX">
          <el-input v-model="paramFormBase.blockStrideSizeX" placeholder="X" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label=""  prop="blockStrideSizeY">
          <el-input v-model="paramFormBase.blockStrideSizeY" placeholder="Y" autocomplete="off"></el-input>
        </el-form-item>

        <el-form-item label="细胞元大小"  prop="cellSizeX">
          <el-input v-model="paramFormBase.cellSizeX" placeholder="X" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label=""  prop="cellSizeY">
          <el-input v-model="paramFormBase.cellSizeY" placeholder="Y" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="特征和维数"  prop="countHogNum">
          <el-input v-model="paramFormBase.countHogNum" placeholder="直方图特征数量" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label=""  prop="dimension">
          <el-input v-model="paramFormBase.dimension" placeholder="特征维数" autocomplete="off"></el-input>
        </el-form-item>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="paramCancel">取 消</el-button>
        <el-button type="primary" @click="trainFile">确 定</el-button>
      </div>
    </el-dialog>

  </el-container>

</template>
<!--主页面板-->
<script>
  import {fileList,imageFileList,batchRemove,trainSvmFile,paramListm,code} from "@/api/base/file"
  const myToken =  localStorage.getItem('accessToken');
  import {showLoading,hideLoading} from '@/utils/loadingUtils';
  const  multipleSelectionList =  new Set([]);
    export default {

      data() {
        return {
          menuVisible: false, //树结构右键 显示框 v-show
          chooseParamDialog:false,
          chooseTitleParamDialog:"模型参数",
          token: {'Authorization':  myToken},
          currentNodeData: null,
          useCheck:false,
          defaultProps: {//绑定树结构映射基础参数
            label: 'title',
            children: 'children'
          },
          uploadData:{ savePath:""},
          setTree: [],  //全部后台树结构数据绑定对象
          dataList: [],
          multipleSelection: multipleSelectionList,
          total: 0,
          requestParameters: {
            filePath: "",
            page: 1,
            size: 10,
          },
          //定义弹框绑定显示状态
          dialogFormVisible: false,
          isChildFile: false,
          currentNodeObject: null,
          currentNodeData: null,
          currentNodeParentObject: null,
          currentNodeParentData: null,
          //模型参数表单
          paramFormBase:{
            'svmType':  "100",
            'svmKernel': "0",
            'svmC': '0.2',

            'winSizeX':64,
            'winSizeY':128,

            'blockSizeX':16,
            'blockSizeY':16,

            'blockStrideSizeX':8,
            'blockStrideSizeY':8,

            'cellSizeX': 8,
            'cellSizeY': 8,

            'countHogNum': 9,
            'dimension': 3780,
            'url':''
          },
          // paramRules:{
          //   svmType: [
          //     {  required: true, message: '请选择一个类型', trigger: 'change' }
          //   ],
          //   svmKernel: [
          //     {  required: true, message: '请选择一个内核', trigger: 'change' }
          //   ],
          //   svmC: [
          //     { required: true, message: '请输入', trigger: 'blur' },
          //     { min: 1, max:3, message: '长度在 1 到 3 个字符', trigger: 'blur' }
          //   ],
          //   winSizeX: [
          //     { required: true, message: '请输入', trigger: 'blur' },
          //     { min: 1, max:3, message: '长度在 1 到 3 个字符', trigger: 'blur' }
          //   ],
          //   winSizeY: [
          //     { required: true, message: '请输入', trigger: 'blur' },
          //     { min: 1, max:3, message: '长度在 1 到 3 个字符', trigger: 'blur' }
          //   ],
          //   blockSizeX: [
          //     { required: true, message: '请输入', trigger: 'blur' },
          //     { min: 1, max:3, message: '长度在 1 到 3 个字符', trigger: 'blur' }
          //   ],
          //   blockSizeY: [
          //     { required: true, message: '请输入', trigger: 'blur' },
          //     { min: 1, max:3, message: '长度在 1 到 3 个字符', trigger: 'blur' }
          //   ],
          //   blockStrideSizeX: [
          //     { required: true, message: '请输入', trigger: 'blur' },
          //     { min: 1, max:3, message: '长度在 1 到 3 个字符', trigger: 'blur' }
          //   ],
          //   blockStrideSizeY: [
          //     { required: true, message: '请输入', trigger: 'blur' },
          //     { min: 1, max:3, message: '长度在 1 到 3 个字符', trigger: 'blur' }
          //   ],
          //   cellSizeX: [
          //     { required: true, message: '请输入', trigger: 'blur' },
          //     { min: 1, max:3, message: '长度在 1 到 3 个字符', trigger: 'blur' }
          //   ],
          //   cellSizeY: [
          //     { required: true, message: '请输入', trigger: 'blur' },
          //     { min: 1, max:3, message: '长度在 1 到 3 个字符', trigger: 'blur' }
          //   ],
          //   countHogNum: [
          //     { required: true, message: '请输入', trigger: 'blur' },
          //     { min: 1, max:3, message: '长度在 1 到 3 个字符', trigger: 'blur' }
          //   ],
          //   dimension: [
          //     { required: true, message: '请输入', trigger: 'blur' },
          //     { min: 1, max:4, message: '长度在 1 到 4 个字符', trigger: 'blur' }
          //   ],
          // },
          svmCList:[],
          svmKernelList:[],
          svmTypeList:[],
        }
      },

      methods: {

        /*
        * 查询菜单树结构
        */
        doQueryFile() {
          fileList()
            .then(res => {
              let resp = res.data;
              this.setTree = resp.data;
            })
        },

        /*
        * 查询用户表格
        */
        doImageListQuery(params) {
          imageFileList(this.requestParameters)
            .then(res => {
              let resp = res.data;
              this.dataList = resp.data;
              this.total = resp.total;

            })
        },

        /**
         * 表格格式化内容
         */
        formatterFileSize(row, column) {
          let size  = row['fileSize'];
          let data = ((size / (1024 * 1024))*100 ).toFixed(2)+ "MB";
          return data;
        },
        /*
        *  左键单击菜单树结构，
        *  1.控制表单的展示类型
        *  2.恢复默认只读和禁用状态
        */
        nodeClick(object, value){
          this.requestParameters.page=1;
          this.requestParameters.size=10;
          this.currentNodeData = object;
          let searchPath = "";
          if (value.level===1){
            this.requestParameters.filePath= value.data.title;
            this.uploadData.savePath = value.data.title;
          }else if (value.level===2){
            searchPath = value.parent.data.title+"//"+value.data.title;
            this.requestParameters.filePath= searchPath;
            this.uploadData.savePath = value.parent.data.title;
          }
          this.doImageListQuery( this.requestParameters);

        },
        /*
        *改变每页显示数
        */
        handleSizeChange(val) {
          this.requestParameters.size = val;
          this.doImageListQuery()
        },

        /*
        *改变当前页码数
       */
        handleCurrentChange(val) {
          this.requestParameters.page = val;
          this.doImageListQuery()
        },
        /*
        *  取消选中的树节点
        */
        cancelChooseNode(){
          this.permForm = {};
          this.currentNodeData = [];
          this.currentNodeData['title'] = "请选择";
          this.showSubmitButton = false;
          //清空复选框的值
          this.$refs.treeObject.setCheckedKeys([]);
        },
        /**
         * 表单取消对话框事件
         */
        cancel() {
          this.dialogFormVisible = false;
          this.$refs['refForm'].resetFields();
        },

        /**
         *  处理文件上传 接口消息回调
         */
        handleAvatarSuccess(res, file){
          let code = res['code'];
          if (code===200){
            this.$message.success('上传成功!');
            this.doQueryFile();
          }else {
            this.$message.error(res['msg']);
          }

        },


        /**
         *  处理文件上传前处理
         */
        beforeAvatarUpload(res, file){
          let path = this.uploadData.savePath;
          if (path==null || path.length<=0){
            this.$message.error("请选择文件目录");
            return false
          }
        },

        /**
         *  批量删除
         */
        batchDelete() {
          let list = this.$refs.multipleTable.selection;
          let deleteNames,deleteUrl=[];
          if (list.length===0){
            this.$message.warning("请勾选操作对象！");
            return false;
          }

          for (let i = 0; i < list.length; i++) {
            if (i===0){
              deleteNames = list[i].fileName;
              deleteUrl.push(list[i].trueUrl);
            }else {
              deleteNames += ","+list[i].fileName;
              deleteUrl.push(list[i].trueUrl);
            }
          }
          this.$confirm(  `本次操作将删除[ ${ deleteNames } ],删除后图片将不可恢复，您确认删除吗？`, {
            type: 'warning'
          }  ).then(() => {
            batchRemove(deleteUrl)
              .then(res => {
                let resp = res.data;
                if (resp.code === 200) {
                  this.$message.success('删除成功!');
                  this.doImageListQuery( this.requestParameters);
                } else {
                  this.$message.error(resp.msg);
                }
              })
          }).catch(() => {
          });

        },
        /*
        *  左侧树结构 多功能菜单功能
        */
        handleCommand(command) {
          if (command==="changCheckStatus"){
            this.useCheck = !this.useCheck
          }else if (command==="chooseAll"){
            if (this.useCheck){
              this.$refs.treeObject.setCheckedNodes(this.setTree);
            }else {
              this.$message({message: "请先开启复选框！",type:  "error"});
            }
          }else if (command==="notChooseAll"){
            if (this.useCheck){
              this.$refs.treeObject.setCheckedKeys([]);
            }
            else {
              this.$message({message: "请先开启复选框！",type:  "error"});
            }
          }else if (command==="expandAll"){
            for(let i=0;i<this.$refs.treeObject.store._getAllNodes().length;i++){
              this.$refs.treeObject.store._getAllNodes()[i].expanded=true;
            }
          }else if (command==="notExpandAll"){
            for(let i=0;i<this.$refs.treeObject.store._getAllNodes().length;i++){
              this.$refs.treeObject.store._getAllNodes()[i].expanded=false;
            }
          }else if (command==="batchDelete"){
            if (this.useCheck){
              this.batchDelete();
            }else {
              this.$message({message: "请先开启复选框！",type:  "error"});
            }
          }
          else if (command==="trainFile"){
            if (this.useCheck){
              this.openChooseParamDialog();
              // this.trainFile();
            }else {
              this.$message({message: "请先开启复选框！",type:  "error"});
            }
          }
        },

        openChooseParamDialog(){
          this.doQueryParam();
          this.chooseParamDialog = true;

        },


        /*
        * 查询配置信息
        */
        doQueryParam() {
          let searchType = { "code":"svmType"};
          let searchKernel = { "code":"svmKernel"};
          code(searchType)
            .then(res => {
              let resp = res.data;
              this.svmTypeList = resp.data;
            })
          code(searchKernel)
            .then(res => {
              let resp = res.data;
              this.svmKernelList = resp.data;
            })
        },


        paramCancel(){
          this.chooseParamDialog = false;
          this.$refs['svmRefForm'].resetFields();
        },


        /**
         * 训练SVM模型
         */
        trainFile(rowData){

              let list = this.$refs.treeObject.getCheckedNodes();
              if (list.length===0){
                this.$message.warning("请勾选操作对象！");
                return false;
              }
              if (list.length<=1){
                this.$message.warning("请勾选两个文件夹对象！");
                return false;
              }
              this.chooseParamDialog = false;
              let deleteNames='',deleteIds='';
              debugger
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
                deleteIds=deleteNames.substr(0);
              }
               this.$confirm(  `请确认选中文件夹[${ deleteNames }]`, {
                type: 'warning'
              }  ).then(() => {
                // submitData.append("url",deleteIds);
                let  submitData = this.paramFormBase;
                submitData.url = deleteNames;
                showLoading();
                trainSvmFile(submitData)
                  .then(res => {
                    let resp = res.data;
                    if (resp.code === 200) {
                      hideLoading();
                      this.$message.success('训练成功!');
                      // this.doQuery();
                    } else {
                      this.$message.error(resp.msg);
                      hideLoading();
                    }
                  })
              })

        },

        /**
         * 表格行删除员工
         */
        handleRowDelete(rowData) {
          let deleteNames,deleteUrl=[];
          deleteUrl.push(rowData.trueUrl);
          this.$confirm(
            `本次操作将删除[ ${rowData.fileName} ]删除后图片将不可恢复，您确认删除吗？`, {
              type: 'warning'
            }
          ).then(() => {
            showLoading();
            batchRemove(deleteUrl)
              .then(res => {
                let resp = res.data;
                if (resp.code === 200) {
                  hideLoading();
                  this.$message.success('删除成功!');
                  this.doImageListQuery( this.requestParameters);
                } else {
                  this.$message.success(resp.msg);
                }
              })
          }).catch(() => {
          });
        },
        /*
        * 右键点击触发菜单
        *  object 当前节点数据
        *  value 当前html对象
        */
        rightClick(event, object, value, element) {

          if (this.objectID !== object.fileId) {
            this.objectID = object.fileId;
            this.menuVisible = true;
            this.currentNodeObject =  value ;
            this.currentNodeData = object;
            this.currentNodeParentObject =  value.parent;
            this.currentNodeParentData = value.parent.data;
          } else {
            this.menuVisible = !this.menuVisible;
          }
          // 给右键菜单添加 点击关闭事件
          document.addEventListener('click',(e)=>{
            this.menuVisible = false;
          });
          //给悬浮口菜单添加 相对位置样式
          let menu = document.querySelector("#rightClickMenu");
          /* 菜单定位基于鼠标点击位置 */
          menu.style.left = event.clientX + 20 -205 + "px";
          menu.style.top = event.clientY - 30 - 60 + "px";

          menu.style.position = "absolute"; // 为新创建的DIV指定绝对定位
          menu.style.width = 130 + "px"; //设置右键菜单的宽度

        },

        /*
        * 菜单激活回调
        */
        handleRightSelect(key) {
          if (key === "1") {
            this.NodeDel(this.currentNodeObject, this.currentNodeObject);
            this.menuVisible = false;
          }
        },
        NodeDel(n, d){//删除节点
          // deleteNewChild 方法删除还没有入库 没有id的节点
          let deleteNewChildNotInDataDB = () => {
            let _list = n.parent.data.children || n.parent.data;//节点同级数据
            let _index = _list.map((c) => c.id).indexOf(d.id);
            console.log(_index)
            _list.splice(_index, 1);
            this.$message.success("删除成功！")
          }
            let tempDeleteNode =  this.currentNodeData; // 弹出框莫名其妙数据丢失
            let urlList= [];
            urlList.push(this.currentNodeData.url);
            this.$confirm(
              `本次操作将删除[ ${this.currentNodeData.title} ]文件夹，您确认删除吗？`, {
                type: 'warning'
              }
            ).then(() => {
              if (tempDeleteNode.fileId){
                batchRemove(urlList)
                  .then(res => {
                    let resp = res.data;
                    if (resp.code === 200) {
                      this.$message.success('删除成功!');
                      this.doQueryFile();
                    } else {
                      this.$message.success(resp.msg);
                    }
                  })
              }else {
                deleteNewChildNotInDataDB()
              }
            }).catch(() => {
            });
          // }
        },
      },
      // 创建完毕状态
      created: function () {
        this.doQueryFile();
      }
    }
</script>

<style scoped>
  .el-input{
    width: 150px;
  }
  .el-select{
    width: 150px;
  }
  .el-dropdown{
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

  .lab-class{
    margin-bottom: 30px;
  }
</style>
