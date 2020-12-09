<template>

  <div>
    <el-card class="box-card">
      <!--表头菜单-->
      <div class="tableHeaderToolButtonGroup">
<!--        <el-button icon="el-icon-plus" size="mini"  @click="handleAdd" ></el-button>-->
<!--        <el-button  icon="el-icon-delete" size="mini"   @click="batchDelete" ></el-button>-->
      </div>
    </el-card>
    <el-card class="tableCard" >
      <!--表格内容  ref绑定选中内容-->
      <el-table :data="dataList"  style="width: 100%" border  ref="multipleTable" >
        <el-table-column type="selection" width="40" prop="userId"> </el-table-column>
        <el-table-column  prop="fileName"  label="文件名" > </el-table-column>
        <el-table-column prop="image" label="图片" min-width="30%" >
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

  </div>

</template>
<!--主页面板-->
<script>
  import {list } from "@/api/base/file"

  import {showLoading,hideLoading} from '@/utils/loadingUtils';
  const  multipleSelectionList =  new Set([]);
    export default {

      data() {
        return {
          dataList: [],
          multipleSelection: multipleSelectionList,
          total: 0,
          requestParameters: {
            filePath: "train/cat",
            page: 1,
            size: 10,
          },
          //定义弹框绑定显示状态
          dialogFormVisible: false,
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

        /**
         * 表格格式化内容
         */
        formatterFileSize(row, column) {
          let size  = row['fileSize'];
          let data = ((size / (1024 * 1024))*100 ).toFixed(2)+ "MB";
          return data;
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
         * 表单取消对话框事件
         */
        cancel() {
          this.dialogFormVisible = false;
          this.$refs['refForm'].resetFields();
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


</style>
