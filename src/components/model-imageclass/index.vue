<template>
  <el-container style="border: 1px solid #eee">
    <el-row style="width: 100%">
      <el-col :xs="3" :sm="3" :md="3" :lg="3" :xl="3" class="aside">
        <el-card class="box-card">
          <el-row style=" padding-bottom: 4px;">
            <el-button type="primary" icon="fa fa-folder-open" size="small" @click="openTree">      测试集测试</el-button>
          </el-row>
          <el-row style=" padding-bottom: 4px;">
<!--            :on-success="handleAvatarSuccess"-->
            <el-upload
              class="upload-demo inline-block margin-right-10"
              ref="upload"
              accept=".zip"
              action="http://www.tianyu.com/image/match/uploadImage"
              :limit="1"

              :before-upload="beforeAvatarUpload"
              :headers="token"
              :data = uploadData
              :auto-upload="true">
              <el-button type="primary" icon="fa fa-image" size="small" @click="">  上传一张图片</el-button>
            </el-upload>
          </el-row>
          <el-row >
            <el-form :model="svmFormBase" status-icon   ref="refForm" >
             <el-form-item label="" prop="" >
              <el-select v-model="svmFormBase.svmVersionId"  placeholder="请选择SVM版本" size="small" @change="getSvmSelectData(data)">
                <el-option
                  v-for="item in smvData"
                  :key="item.svmId"
                  :label="item.name"
                  :value="item.svmId">
                </el-option>
              </el-select>
            </el-form-item>
            </el-form>
          </el-row>
        </el-card>
      </el-col>


      <el-col :offset="1" :xs="8" :sm="11" :md="13" :lg="15" :xl="16">
        <el-card class="box-card">
          <!--表头菜单-->
          <div class="tableHeaderToolButtonGroup">
                    <el-button icon="el-icon-delete" size="mini"  @click="" >清空列表</el-button>
          </div>
        </el-card>
        <el-card class="tableCard" >
          <el-table :data="dataList"  style="width: 100%" border  ref="multipleTable" >
            <el-table-column type="selection" width="40" prop="imageId"> </el-table-column>
            <el-table-column  prop="fileName"  label="文件名" > </el-table-column>
            <el-table-column prop="image" label="图片" min-width="30%" >
              <!-- 图片的显示 -->
<!--              <template   slot-scope="scope">-->
<!--                &lt;!&ndash;            <img :src="scope.row.url"  min-width="70" height="70" />&ndash;&gt;-->
<!--                <div class="demo-image__preview">-->
<!--                  <el-image-->
<!--                    style="width: 100px; height: 75px"-->
<!--                    :src="scope.row.url"-->
<!--                    :preview-src-list=[scope.row.url]>></el-image>-->
<!--                </div>-->
<!--              </template>-->
            </el-table-column>
            <el-table-column  prop="score"  label="得分" > </el-table-column>
            <el-table-column  prop="probability"  label="概率" > </el-table-column>
            <el-table-column  prop="classification"  label="分类预测" > </el-table-column>
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
  import {fileList,testSvmFile,probabilityList,svmList} from "@/api/base/file"
  import {showLoading,hideLoading} from '@/utils/loadingUtils';
  const myToken =  localStorage.getItem('accessToken');

    export default {

      data() {
        return {
          value: '',
          token: {'Authorization':  myToken},
          smvData: [],
          dataList: [],
          formBase: {},
          uploadData:'',
          FileFormBase:{},
          svmFormBase:{
            svmVersionId:"",
          },
          //树节点绑定
          setTree: [],  //全部后台树结构数据绑定对象
          defaultProps: {//绑定树结构映射基础参数
            label: 'title',
            children: 'children'
          },
          useCheck:false,
          TreeDialog: false,
          titleDialog:"选择",
          //定义表单初始化参数
          checkInfo: {
            svmVersionId:"",
            fileUrl:""
          },

          //表格分页
          total: 0,
          requestParameters: {
            page: 1,
            size: 10,
          },

        }
      },

      methods: {
        /**
         *  处理文件上传前处理
         */
        beforeAvatarUpload(res, file){
          let path = this.uploadData.savePath;
          if (path==null || path.length<=0){
            this.$message.error("请选择一张图片");
            return false
          }
        },
        openTree(){
          this.TreeDialog = true;
          this.doQueryFile();
        },
        /**
         * 表单取消对话框事件
         */
        cancel() {
          this.TreeDialog = false;
          this.$refs['refForm'].resetFields();
        },
        /*
        * 查询SVM版本列表
        */
        doQuerySvmList() {
          svmList()
            .then(res => {
              let resp = res.data;
              this.smvData = resp.data;
              console.log(resp.data)
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

        getSvmSelectData(data){
          console.log(data)
        },

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
          let deleteNames,deleteIds;
          for (let i = 0; i < list.length; i++) {
            if (list[i].url=="train" ||list[i].url=="match" ){
              continue
            }
            if (i===0){
              deleteNames = list[i].url.replace(/\\/g,'//');
              deleteIds = list[i].url.replace(/\\/g,'//');
            }else {
              deleteNames += ","+list[i].url.replace(/\\/g,'//');
              deleteIds +=  ","+list[i].url.replace(/\\/g,'//');
            }
          }
          this.$confirm(  `请确认选中文件夹[${ deleteNames }]`, {
            type: 'warning'
          }  ).then(() => {
            let submitInfo = {
              svmVersionId: this.svmFormBase.svmVersionId,
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
                  this.$message.error(resp.msg);
                  hideLoading();
                }
              })
          })
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
  .el-select{
    width: 150px;
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
</style>
