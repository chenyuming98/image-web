<template>
  <el-container style="border: 1px solid #eee">
    <el-row style="width: 100%">
      <el-col  :xs="8" :sm="14" :md="24" :lg="24" :xl="24">
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
            <el-table-column  prop="name"  label="文件名" > </el-table-column>
            <el-table-column  prop="info"  label="信息" > </el-table-column>
            <el-table-column  prop="createTime"  label="创建时间" > </el-table-column>
            <el-table-column  prop="svmType"  label="SVM类型" > </el-table-column>
            <el-table-column  prop="svmKernel"  label="SVM内核" > </el-table-column>
            <el-table-column  prop="svmC"  label="惩罚因子" > </el-table-column>
            <el-table-column  prop="winSizeX"  label="图片归一化" >
              <template slot-scope="scope">
                <span style="margin-left: 10px">{{ scope.row.winSizeX }}</span>
                <span style="margin-left: 10px">,</span>
                <span style="margin-left: 10px">{{ scope.row.winSizeY }}</span>
              </template>
            </el-table-column>
            <el-table-column  prop="blockSizeX"  label="每个块大小" >
              <template slot-scope="scope">
                <span style="margin-left: 10px">{{ scope.row.blockSizeX }}</span>
                <span style="margin-left: 10px">,</span>
                <span style="margin-left: 10px">{{ scope.row.blockSizeY }}</span>
              </template></el-table-column>
            <el-table-column  prop="blockSizeX"  label="块滑动增量" >
              <template slot-scope="scope">
                <span style="margin-left: 10px">{{ scope.row.blockStrideSizeX }}</span>
                <span style="margin-left: 10px">,</span>
                <span style="margin-left: 10px">{{ scope.row.blockStrideSizeY }}</span>
              </template></el-table-column>
            <el-table-column  prop="countHogNum"  label="特征数量" > </el-table-column>
            <el-table-column  prop="dimension"  label="维数" > </el-table-column>
            <el-table-column  fixed="right"  label="操作" >
              <template slot-scope="scope">
                <el-button @click="handleIndex(scope.row)" type="text" size="small">设置</el-button>
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
    <!--2. 添加编辑表单  -->
    <el-dialog :title="formTitle"  :visible.sync="dialogFormVisible" :before-close="cancel" :close-on-click-modal="false" :width="'40%'">
      <!-- :model绑定表单对象  status-icon控制每一行表单校验通过后图标显示正确和错误   :rules绑定校验规则
              autocomplete="off" 关闭表单默认以及功能-->

      <div slot="footer" class="dialog-footer">
        <el-button @click="cancel">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <!--        <el-button @click="resetForm('refForm')">重置</el-button>-->
      </div>
    </el-dialog>

  </el-container>

</template>
<!--主页面板-->
<script>
  import {svmInfoList,deletesSvmDatList,setIndexSvm} from "@/api/base/file"
  const myToken =  localStorage.getItem('accessToken');
  import {showLoading,hideLoading} from '@/utils/loadingUtils';
  const  multipleSelectionList =  new Set([]);
    export default {

      data() {
        return {
          formTitle: '',
          token: {'Authorization':  myToken},
          uploadData:{ savePath:""},
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

        }
      },

      methods: {
        /*
        * 查询SVM
        */
        doQuery(params) {
          svmInfoList(this.requestParameters)
            .then(res => {
              let resp = res.data;
              this.dataList = resp.data;
              this.total = resp.total;

            })
        },

        /**
         *  表头批量SVM文件
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
              deleteIds = list[i].svmId;
            }else {
              deleteNames += ","+list[i].name;
              deleteIds +=  ","+list[i].svmId;
            }
          }
          this.$confirm(  `本次操作将删除[ ${ deleteNames } ]版本文件，删除后将不可恢复，您确认删除吗？`, {
            type: 'warning'
          }  ).then(() => {
            submitData.append("ids",deleteIds);
            deletesSvmDatList(submitData)
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
         * 表格行-设置主页搜索SVM文件
         */
        handleIndex(rowData) {
          this.$confirm(
            `本次操作将把[ ${rowData.name} ]设置为网站搜索基础文件！`, {
              type: 'warning'
            }
          ).then(() => {
            setIndexSvm(rowData)
              .then(res => {
                let resp = res.data;
                if (resp.code === 200) {
                  this.$message.success('设置成功!');
                  this.doQuery();
                } else {
                  this.$message.success(resp.msg);
                }
              })
          }).catch(() => {

          });
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
