<!--后台首页-->
<template>

    <el-col class="homepage" :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
      <!--   第一行4卡片内容   -->

      <!--   今日访问人数  -->
      <el-row :gutter="12">
        <el-col :span="6">
          <el-card shadow="always">
            <p style="font-size:13px;font-family:'Microsoft YaHei';color: #999999">
              今日新增训练图片数
            </p>
            <p style="font-size:28px;font-family:'Microsoft YaHei'">
              <i class="el-icon-thumb"></i> {{nowLabel.todayAddTotal}}
            </p>
            <p style="font-size:13px;font-family:'Microsoft YaHei'">
              周同比30%  <i class="el-icon-arrow-up"></i> 日同比56% <i class="el-icon-arrow-down"></i>
            </p>
            <el-divider></el-divider>
            <p style="font-size:13px;font-family:'Microsoft YaHei';float:left;">
              总训练图片数
            </p>
            <p style="font-size:13px;font-family:'Microsoft YaHei';float:left;">
              <i class="el-icon-thumb"></i> {{nowLabel.trainTotal}}
            </p>
          </el-card>
        </el-col>

        <!-- 今日注册数  -->
        <el-col :span="6">
          <el-card shadow="always">
            <p style="font-size:13px;font-family:'Microsoft YaHei';color: #999999">
              今日接口访问
            </p>
            <p style="font-size:28px;font-family:'Microsoft YaHei'">
              <i class="el-icon-s-check"></i> 80
            </p>
            <p style="font-size:13px;font-family:'Microsoft YaHei'">
              周同比12%  <i class="el-icon-arrow-up"></i> 日同比11% <i class="el-icon-arrow-down"></i>
            </p>
            <el-divider></el-divider>
            <p style="font-size:13px;font-family:'Microsoft YaHei';float:left;">
              总访问数
            </p>
            <p style="font-size:13px;font-family:'Microsoft YaHei';float:left;">
              <i class="el-icon-s-check"></i> 452,625
            </p>
          </el-card>
        </el-col>

        <!--  系统故障统计  -->
        <el-col :span="6">
          <el-card shadow="always">
            <p style="font-size:13px;font-family:'Microsoft YaHei';color: #999999">
              今日系统故障数
            </p>
            <p style="font-size:28px;font-family:'Microsoft YaHei'">
              <i class="el-icon-bell"></i> 8
            </p>
            <p style="font-size:13px;font-family:'Microsoft YaHei'">
              周同比1.2%  <i class="el-icon-arrow-up"></i> 日同比2.7% <i class="el-icon-arrow-down"></i>
            </p>
            <el-divider></el-divider>
            <p style="font-size:13px;font-family:'Microsoft YaHei';float:left;">
              总异常数
            </p>
            <p style="font-size:13px;font-family:'Microsoft YaHei';float:left;">
              <i class="el-icon-data-line "></i> 5,206
            </p>
          </el-card>
        </el-col>
        <!-- 待办事项 -->
        <el-col :span="6">
          <el-card shadow="always">
            <p style="font-size:13px;font-family:'Microsoft YaHei';color: #999999">
              待办事项
            </p>
            <p style="font-size:28px;font-family:'Microsoft YaHei'">
              <i class="el-icon-edit"></i> 3
            </p>
            <p style="font-size:13px;font-family:'Microsoft YaHei'">
              正在处理 2 <i class="el-icon-document-copy"></i> 未解决 1 <i class="el-icon-close"></i>
            </p>
            <el-divider></el-divider>
            <p style="font-size:13px;font-family:'Microsoft YaHei';float:left;">
              总解决数
            </p>
            <p style="font-size:13px;font-family:'Microsoft YaHei';float:left;">
              <i class="el-icon-check"></i> 8
            </p>
          </el-card>
        </el-col>
      </el-row>

      <!--   第一行 日期内容   -->
      <el-card  shadow="always" style="margin-top: 14px">
        <el-row :gutter="10">
          <el-col :span="12">
            <div class="grid-content bg-purple">
             <div id="main" style="width: 800px;height: 400px;"></div>
            </div>
          </el-col>
          <el-col :span="12"><div class="grid-content bg-purple">
<!--            <el-calendar v-model="value">-->
<!--            </el-calendar>-->
          </div></el-col>
        </el-row>
      </el-card>

    </el-col>


</template>

<script>
  import echarts from 'echarts'
  import {labelInfo,getStaticInfo } from "@/api/base/index";
  var trainTotal = 0,todayAddTotal = 0;
    export default {
        name: "home",
        data() {
          return {
            value: new Date(),
            charts: '',
            nowLabel:{
              'trainTotal': 0,
              'todayAddTotal': 0,
               'xdata':[],
               'ydata':[],
            },
            option: {
              title: {
                text: '最近一周访问次数',
              },
              color: ['#3398DB'],
              tooltip: {
                trigger: 'axis',
                axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                  type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
                }
              },
              grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
              },
              xAxis: [
                {
                  type: 'category',
                  data: [],
                  axisTick: {
                    alignWithLabel: true
                  }
                }
              ],
              yAxis: [
                {
                  type: 'value'
                }
              ],
              series: [
                {
                  name: '次数',
                  type: 'bar',
                  barWidth: '60%',
                  data: []
                }
              ]
            },
          }
        },
        methods: {
          drawPie(id) {
            this.charts = echarts.init(document.getElementById(id));
            this.charts.setOption(this.option)
          },

          doQueryLabelInfo() {
          labelInfo()
            .then(res => {
              let resp = res.data;
              if (resp.data) {
                this.nowLabel.trainTotal = resp.data['trainTotal'];
                this.nowLabel.todayAddTotal = resp.data['todayAddTotal'];
                this.option.xAxis[0].data= resp.data['statisticsVisitMap']['day'];
                this.option.series[0].data = resp.data['statisticsVisitMap']['data'];
                this.drawPie('main');
              }
            });

          },

          doQueryStaticInfo() {
            getStaticInfo()
              .then(res => {
                let resp = res.data;
                if (resp.data) {
                  this.option.xAxis[0].data= resp.data['statisticsVisitMap']['day'];
                  this.option.series[0].data = resp.data['statisticsVisitMap']['data'];
                  this.drawPie('main');
                }
              });
            },

        },
        //调用
        mounted(){
        },
      // 创建完毕状态
      created: function () {
        this.username = window.localStorage.getItem("username");
        this.doQueryLabelInfo();
        this.doQueryStaticInfo();
      },
    }
</script>

<style scoped>

</style>
