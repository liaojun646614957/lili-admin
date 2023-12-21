<template>
  <!-- $t is vue-i18n global function to translate lang -->
  <div class="app-container">
    <div>
      <el-button
        type="primary"
        icon="el-icon-edit"
        style="margin-bottom: 20px;"
        @click="handleImport()"
      >导入客户名单</el-button>
    </div>
    <el-dialog title="导入客户名单" :visible.sync="dialogVisible">
      <el-link type="primary" @click="handleDownloadTemplate()">下载模版</el-link>
      <el-row style="margin-top: 10px;">
        <el-col :span="2">上传：</el-col>
        <el-col :span="22">
          <el-upload
            ref="upload"
            action="#"
            :auto-upload="false"
            :multiple="false"
            accept=".xlsx"
            :limit="1"
            :file-list="fileList"
            :http-request="uploadHttpRequest"
            :before-upload="beforeUpload"
            :on-remove="fileRemove"
            :on-change="fileChange"
          >
            <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
          </el-upload>
        </el-col>
      </el-row>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :disabled="uploadDisabled" @click="submitUpload">确定</el-button>
      </div>
    </el-dialog>

    <el-table
      ref="multipleTable"
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
    >
      <el-table-column align="center" label="Id" width="100px">
        <template slot-scope="scope">
          {{ scope.row.id }}
        </template>
      </el-table-column>
      <el-table-column label="导入文件名" align="center">
        <template slot-scope="scope">
          {{ scope.row.srcFile }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="创建时间" width="300px">
        <template slot-scope="scope">
          <i class="el-icon-time" />
          <span>{{ scope.row.createTime | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="150px" align="center">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.status===1" type="info" effect="dark">获取数据中</el-tag>
          <el-tag v-if="scope.row.status===2" type="success" effect="dark">获取完成</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200px" align="center">
        <template slot-scope="scope">
          <el-button :disabled="(scope.row.status!==2)" type="primary" size="mini" @click="handleDownload(scope.row.id)">下载</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="getList"
    />
  </div>
</template>

<script>
import { fetchCustomerExcelList, importCustomer, downloadExcel } from '@/api/customer'
import Pagination from '@/components/Pagination'
export default {
  name: 'ExportExcel',
  components: { Pagination },
  data() {
    return {
      dialogVisible: false,
      uploadDisabled: true,
      fileList: [],
      list: [],
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20
      },
      downloadLoading: false,
      filename: '',
      autoWidth: true,
      bookType: 'xlsx'
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      fetchCustomerExcelList(this.listQuery).then(response => {
        this.list = response.data.items
        this.total = response.data.total
        this.listLoading = false
      })
    },
    handleImport() {
      this.dialogVisible = true
      this.fileList = []
    },
    submitUpload() {
      this.$refs.upload.submit()
    },
    beforeUpload(file) {
      console.log(file.type)
      const isType = file.type === 'application/vnd.ms-excel'
      const isTypeComputer = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      const fileType = isType || isTypeComputer
      if (!fileType) {
        this.$message.error('上传文件只能是xls/xlsx格式！')
      }
      const fileLimit = file.size / 1024 / 1024 < 10
      if (!fileLimit) {
        this.$message.error('上传文件大小不超过10M！')
      }
      return fileType && fileLimit
    },
    fileChange(file, fileList) {
      if (fileList.length > 0) {
        this.fileList = [fileList[fileList.length - 1]]
        this.uploadDisabled = false
      }
    },
    fileRemove(file, fileList) {
      if (fileList.length < 1) {
        this.uploadDisabled = true
      }
    },
    handleDownloadTemplate() {
      const a = document.createElement('a')
      a.href = `/static/template.xlsx`
      a.download = '客户信息导入模版.xlsx'
      a.click()
    },
    handleRemove(file, fileList) {
      console.log(file, fileList)
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleDownload(id) {
      downloadExcel(id).then(response => {
        console.log(response)
        const filename = response.headers['content-disposition'].split('filename=')[1]
        const blob = new Blob([response.data])
        // 创建一个虚拟的链接，并设置下载属性
        const link = document.createElement('a')
        link.href = window.URL.createObjectURL(blob)
        link.download = decodeURIComponent(filename)
        link.click()
        // 释放对象URL资源
        window.URL.revokeObjectURL(link.href)
      })
    },
    uploadHttpRequest(param) {
      const formData = new FormData()
      formData.append('file', param.file)
      importCustomer(formData).then(response => {
        this.$notify({
          title: '成功',
          message: '导入客户信息成功',
          type: 'success',
          duration: 2000
        })
        this.dialogVisible = false
        this.getList()
      })
    }
  }
}
</script>

<style>
.radio-label {
  font-size: 14px;
  color: #606266;
  line-height: 40px;
  padding: 0 12px 0 30px;
}
</style>
