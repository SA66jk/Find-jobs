<template>
	<div>
		<el-form :inline="true" :model="formInline" class="user-search">
			<el-form-item label=""><el-input size="small" v-model="formInline.biaoti" placeholder="Enter a title"></el-input></el-form-item>
			<el-form-item label=""><el-input size="small" v-model="formInline.leibie" placeholder="Enter the category"></el-input></el-form-item>

			<el-form-item>
				<el-button size="small" type="primary" icon="el-icon-search" @click="search">Search</el-button>
				<el-button size="small" type="primary" icon="el-icon-plus" @click="handleEdit()" >Add</el-button>

				<el-button size="small" type="danger" icon="el-icon-delete" @click="handleDeleteList()" v-if="userInfo.roles[0] == 'guanliyuan'">Delete in bulk</el-button>
			</el-form-item>
		</el-form>
		<el-table size="small" :data="listData" highlight-current-row v-loading="loading" border element-loading-text="Loading..." @selection-change="handleSelectionChange">
			<el-table-column align="center" type="selection" width="60"></el-table-column>
			<el-table-column sortable prop="biaoti" label="Title"></el-table-column>
			<el-table-column sortable prop="leibie" label="Category"></el-table-column>
			<el-table-column sortable prop="dianjilv" label="Hits"></el-table-column>

			<el-table-column sortable prop="addtime" label="Add Time" width="160">
				<template slot-scope="scope">
					<div>{{scope.row.addtime|datePipe('yyyy-MM-dd hh:mm:ss')}}</div>
				</template>
			</el-table-column>

			<el-table-column align="center" label="Operate" min-width="160">
				<template slot-scope="scope">

					<!--liangbuan-->
					<el-button size="mini" type="success" @click="handleEdit(scope.$index, scope.row)" v-if="userInfo.roles[0] == 'guanliyuan' ">Edit</el-button>
					<el-button size="mini" type="danger" @click="deleteXinwentongzhi(scope.$index, scope.row)" v-if="userInfo.roles[0] == 'guanliyuan' ">Delete</el-button>
					<el-button size='mini' type='primary' @click="handleDetail(scope.$index, scope.row)">Detailed</el-button>
					<el-button size="mini" type="info" @click="handleContent(scope.$index, scope.row)" v-if="userInfo.roles[0] == 'guanliyuan'">Content settings</el-button>
				</template>
			</el-table-column>
		</el-table>
		<Pagination v-bind:child-msg="pageparm" @callFather="callFather"></Pagination>

		<el-dialog :title="title" :visible.sync="editFormVisible" width="30%" @click="closeDialog">
			<el-form label-width="120px" :model="editForm" :rules="rules" ref="editForm">
				<el-form-item  label="Title" prop="biaoti"><el-input size="small" v-model="editForm.biaoti" auto-complete="off" placeholder="Please enter a title" style='width:100%'></el-input></el-form-item>
		<el-form-item  label="Category" prop="leibie"><el-input size="small" v-model="editForm.leibie" auto-complete="off" placeholder="Please enter a category" style='width:50%'></el-input></el-form-item>

		<el-form-item  label="Hits" prop="dianjilv"><el-input-number size="small" v-model="editForm.dianjilv" auto-complete="off" placeholder="Please enter the account numberHits" style='width:50%'></el-input-number></el-form-item>


			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button size="small" @click="closeDialog">Cancel</el-button>
				<el-button size="small" type="primary" :loading="loading" class="title" @click="submitForm('editForm')">Save</el-button>
			</div>
		</el-dialog>


			<!--xiangxidhk-->
	</div>
</template>

<script>
import Pagination from "@/layout/pagination/Pagination";
import { xinwentongzhiList, xinwentongzhiSave, xinwentongzhiDelete,xinwentongzhiEdit,xinwentongzhiDeleteList } from '@/api/xinwentongzhi/xinwentongzhiApi';


import {Session} from "@/utils/storage";
export default {
	name: 'user',
	data() {
		return {
			loading: false, //是显示加载
			title: '',

			editFormVisible: false, //控制Edit页面显示与隐藏
			//detaitFormVsisisble


			editForm: {
			},
			user:[],

			rules: {
				biaoti: [{ required: true, message: 'Please enter a title', trigger: 'blur' },
				],
				leibie: [{ required: true, message: 'Please enter a category', trigger: 'blur' },
				],
				dianjilv: [{ type: 'number', message: 'Hits必须为数字'},
				],

			},

			formInline: {
				page: 1,
				limit: 10,
			},


			listData: [],
			xinwentongzhis:[],

			checkmenu: [],
			pageparm: {
				currentPage: 1,
				pageSize: 10,
				total: 0
			}
		};
	},
	computed:{
		headers(){
			return {"token":Session.get("token")}
		}
	},
	watch: {
			'$route' (to, from) {
				// 路由发生变化页面刷新
				this.$router.go(0);
			}
		},
	components: {
		Pagination
	},
	created() {

		if (!Session.get('userInfo')) return false;
		this.userInfo = Session.get('userInfo');

		this.getdata(this.formInline)

	},
	methods: {
		getdata(parameter) {
			xinwentongzhiList(parameter)
					.then(res => {
						this.loading = false
						if (res.success == false) {
							this.$message({
								type: 'info',
								message: res.msg
							})
						} else {
							this.listData = res.data.list


							// 分页赋值
							this.pageparm.currentPage = this.formInline.current
							this.pageparm.pageSize = this.formInline.currentNum
							this.pageparm.total = res.data.total
						}
					})
					.catch(err => {
						this.loading = false
						this.$message.error('Failed to load menu, please try again later!')
					})
		},

		// 分页插件事件
		callFather(parm) {
			this.formInline.current = parm.currentPage
			this.getdata(this.formInline)
		},

		// Search事件
		search() {
			this.getdata(this.formInline)
		},
		//显示Edit界面
		handleEdit: function (index, row) {
			this.editFormVisible = true
			if (row != undefined && row != 'undefined') {
				this.title = 'Modify the press notification'
				this.editForm = row
			} else {
				this.title = 'AddNews Notice'
				this.editForm = {}


			}
		},
		handleContent: function (index, row) {this.$router.push('/xinwentongzhi/tinymceEditor/'+row.id)},
		handleDetail(index, row) {const w = window.open("about:blank");w.location.href = 'http://localhost:8081/#/xinwentongzhidetail/'+row.id;},
		//liangbuedit
		// Edit、增加页面Save方法
		submitForm(editData) {
			this.$refs[editData].validate(valid => {
				if (valid) {
					if(this.editForm.id){
						xinwentongzhiEdit(this.editForm).then(res => {
							this.editFormVisible = false

							this.loading = false
							if (res.code == '0') {
								this.getdata(this.formInline)
								this.$message({
									type: 'success',
									message: '新闻通知修改成功！'
								})
							} else {
								this.$message({
									type: 'info',
									message: res.msg
								})
							}
						}).catch(err => {
							this.editFormVisible = false
							this.loading = false
							this.getdata(this.formInline)
						if(err){
								this.$message.error(err)
							}else {
								this.$message.error('Operate失败，请稍后再试！')
							}
						})
					}else {
						xinwentongzhiSave(this.editForm).then(res => {
							this.editFormVisible = false
							this.loading = false
							if (res.code == '0') {

								this.getdata(this.formInline)
								this.$message({
									type: 'success',
									message: 'The news notification was added！'
								})
							} else {
								this.$message({
									type: 'info',
									message: res.msg
								})
							}
						}).catch(err => {
							this.editFormVisible = false
							this.loading = false
						if(err){
								this.$message.error(err)
							}else {
								this.$message.error('Operate失败，请稍后再试！')
							}
						})
					}
				} else {
					return false
				}
			})
		},
		// Delete公司
		deleteXinwentongzhi(index, row) {
			this.$confirm('Are you sure you want to delete?', 'Info', {
				confirmButtonText: 'sure',
				cancelButtonText: 'Cancel',
				type: 'warning'
			}).then(() => {
				xinwentongzhiDelete(row.id).then(res => {
					if (res.code == '0') {
						this.$message({
								type: 'success',
							message: 'The deletion is successful!'
						})
						this.getdata(this.formInline)
					} else {
						this.$message({
							type: 'info',
							message: res.msg
						})
					}
				}).catch(err => {
					this.loading = false
					this.$message.error('Operate失败，请稍后再试')
				})
			}).catch(() => {
				this.$message({
					type: 'info',
					message: 'Deleted from the program'
				})
			})
		},
		handleSelectionChange(val){
			this.xinwentongzhis = val;
		},
		handleDetail(index, row) {const w = window.open("about:blank");w.location.href = 'http://localhost:8080/#/xinwentongzhidetail/'+row.id;},
		handleDeleteList(){
			const xinwentongzhis = this.xinwentongzhis;
			if(xinwentongzhis.length == 0){
				this.$message({
					type: 'error',
					message: 'Please select at least one item to delete'
				})
			}else {
				this.$confirm('Are you sure you want to delete in bulk?', 'Info', {
					confirmButtonText: 'sure',
					cancelButtonText: 'Cancel',
					type: 'warning'
				}).then(() => {
					xinwentongzhiDeleteList(xinwentongzhis).then(res => {
						if (res.code == '0') {
							this.$message({
								type: 'success',
								message: 'The batch deletion is successful!'
							})
							this.getdata(this.formInline)
						} else {
							this.$message({
								type: 'info',
								message: res.msg
							})
						}
					}).catch(err => {
						this.loading = false
						this.$message.error('Operate失败，请稍后再试')
					})
				}).catch(() => {
					this.$message({
						type: 'info',
						message: 'Deleted from the program'
					})
				})
			}
		},
		//xuaxnzeshxifou




		// 关闭Edit、增加弹出框
		closeDialog() {
			this.getdata(this.formInline)
			this.editFormVisible = false
		}
	},
};
</script>

<style scoped lang="scss">
	@import './index.scss';
</style>
