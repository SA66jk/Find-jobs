<template>
	<div class="login">
		<div class="login-weaper">
			<div class="login-left">
				<img src="./call-center-1015274_640.jpg">
			</div>
			<div class="login-right">
				<div class="w3_info">
					<h2>{{ getThemeConfig.globalTitle }}</h2>
					<el-form class="el-form login-form" :model="ruleForm" :rules="rules" ref="ruleForm">
						<el-form-item style="margin-left: 0px" prop="username">
							<el-input type="text"
									:placeholder="$t('message.login.placeholder1')"
									prefix-icon="el-icon-user"
									v-model="ruleForm.username"
									clearable
									autocomplete="off" >
							</el-input>
						</el-form-item>
						<el-form-item style="margin-left: 0px" prop="password">
							<el-input type="password"
									:placeholder="$t('message.login.placeholder2')"
									prefix-icon="el-icon-lock"
									v-model="ruleForm.password"
									autocomplete="off"
									:show-password="true" >
							</el-input>
						</el-form-item>
						<el-form-item style="margin-left: 0px" prop="code">
							<div class="el-row" span="24">
								<div class="el-col el-col-16">
									<el-input type="text"
											maxlength="4"
											:placeholder="$t('message.login.placeholder3')"
											prefix-icon="el-icon-position"
											v-model="ruleForm.code"
											clearable
											autocomplete="off" ></el-input>
								</div>
								<div class="el-col el-col-8">
									<div class="login-code">
										<span class="login-code-img" @click="changeCode">{{code}}</span>
									</div>
								</div>
							</div>
						</el-form-item>
						<el-form-item prop="role">
							<el-radio v-model='ruleForm.role' label='Admin'>Admin</el-radio>
<el-radio v-model='ruleForm.role' label='enterprise'>enterprise</el-radio>
<el-radio v-model='ruleForm.role' label='Job Seekers'>Job Seekers</el-radio>

						</el-form-item>
						<el-form-item style="margin: 40px 0px 0">
							<el-button type="primary" class="login-submit" @click="submitForm('ruleForm')" :loading="submit.loading">
								<span>{{ $t('message.login.btnText') }}</span>
							</el-button>
<!--							<el-button type="primary" class="login-submit" @click="zhuce" ><span>enroll</span></el-button>-->
						</el-form-item>
					</el-form>
				</div>
			</div>
		</div>
		<div class="vue-particles">
			<vue-particles color="#dedede" shapeType="star" linesColor="#dedede" hoverMode="grab" clickMode="push" style="height: 100%"></vue-particles>
		</div>
	</div>
</template>
<script>
import { Session } from '@/utils/storage';
import { formatDate, formatAxis } from '@/utils/formatTime';
import { PrevLoading } from '@/utils/loading.js';
import { quotationsList } from './mock';
import { login } from '../../api/login/index.js'
export default {
	name: 'login',
	data() {
		return {
			quotationsList,
			quotations: {},
			isView: false,
			submit: {
				loading: false,
			},
			ruleForm: {
				username: '',
				password: '',
				code: '',
				role: 'Admin'
			},
			time: {
				txt: '',
				fun: null,
			},
			rules: {
				username: [{ required: true, message: 'Please enter a username', trigger: 'blur' }],
				password: [{ required: true, message: 'Please enter your password', trigger: 'blur' }],
				code: [{ required: true,trigger: 'blur',validator: this.codeValidator }],
				role:[{required:true,message:'请选择角色'}]
			},
			code:'',
		};
	},
	computed: {
		currentTime() {
			return formatAxis(new Date());
		},
		getThemeConfig() {
			return this.$store.state.themeConfig.themeConfig;
		},
	},
	created() {
		this.initCode();
	},
	mounted() {

	},
	methods: {
		codeValidator(rule,value,callback){
			let res
			if(!value) {
				res = rule.required ? new Error('Please enter verification code信息') : undefined
			} else {
				const val = value.trim();
				if(val != this.code){
					res = new Error("验证码信息不正确")
				}
			}
			callback(res)
		},

		zhuce(){
				this.$router.push({name:'register'})
		},
		initCode(){
			let code = Math.floor(Math.random()*(9999-1000))+1000;
			this.code = code;
		},
		changeCode(){
			this.initCode();
		},
		submitForm(formName) {
			this.$refs[formName].validate(valid => {
				if (valid) {
					this.submit.loading = true;
					login(this.ruleForm).then(res=> {
							let defaultRoles = [];
							let defaultAuthBtnList = [];
							// admin 页面权限标识，对应路由 meta.roles
							let guanliyuanRoles = ['guanliyuan'];
							let qiyeRoles = ['qiye'];
let yonghuRoles = ['yonghu'];

							// admin 按钮权限标识
							let adminAuthBtnList = ['btn.add', 'btn.del', 'btn.edit', 'btn.link'];
							if (this.ruleForm.role === 'Admin') {defaultRoles = guanliyuanRoles;defaultAuthBtnList = adminAuthBtnList;}
							if (this.ruleForm.role === 'enterprise') {defaultRoles = qiyeRoles;defaultAuthBtnList = adminAuthBtnList;}
if (this.ruleForm.role === 'Job Seekers') {defaultRoles = yonghuRoles;defaultAuthBtnList = adminAuthBtnList;}

							let user = res.data.user;
							localStorage.setItem("username",this.ruleForm.username);
							localStorage.setItem("cx", this.ruleForm.role);
							user = {...user,time: new Date().getTime(),
								roles: defaultRoles,
								authBtnList: defaultAuthBtnList}
							Session.set('token', res.data.token);
							Session.set('userInfo',user);
							this.$store.dispatch('userInfos/setUserInfos',user);
							PrevLoading.start();
							this.submit.loading = false;
							this.$router.push('/');
							setTimeout(() => {
								this.$message.success(`${this.currentTime}，${this.$t('message.login.signInText')}`);
							}, 300);
					}).catch(msg =>{
						this.submit.loading = false;
						this.$message({
							type: 'error',
							message: msg
						})
					})
				}
			})
		},
	},
	destroyed() {
		clearInterval(this.time.fun);
	},
};
</script>
<style scoped lang="scss">
	.login {
		height: 100%;
		width: 100%;
		overflow: hidden;
		display: flex;
		position: relative;
		.vue-particles {
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			background: #3eb991;
		}
		.login-weaper {
			margin: auto;
			height: 500px;
			display: flex;
			box-sizing: border-box;
			position: relative;
			z-index: 1;
			border: none;
			box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
			.login-left {
				width: 491px;
				padding: 20px;
				font-size: 16px;
				color: var(--prev-color-text-white);
				position: relative;
				background-color: #ffffff;
				display: flex;
				border-top-left-radius: 4px;
				border-bottom-left-radius: 4px;
				.login-time {
					width: 100%;
					color: var(--prev-color-text-white);
					opacity: 0.9;
					font-size: 14px;
					overflow: hidden;
				}
				.login-left-box {
					flex: 1;
					overflow: hidden;
					position: relative;
					z-index: 1;
					display: flex;
					align-items: center;
					padding: 80px 45px;
					.logo {
						font-size: 22px;
						margin-bottom: 15px;
					}
					.title {
						color: var(--prev-color-text-white);
						font-weight: 300;
						letter-spacing: 2px;
						font-size: 16px;
					}
					.msg {
						color: var(--prev-color-text-white);
						font-size: 13px;
						margin-top: 35px;
						.msg-author {
							opacity: 0.6;
							span:last-of-type {
								margin-left: 15px;
							}
						}
						.msg-txt {
							margin-top: 15px;
							line-height: 22px;
						}
					}
				}
			}
			.login-right {
				width: 491px;
				padding: 20px;
				position: relative;
				align-items: center;
				display: flex;
				background-color: var(--prev-bg-white);
				border-top-right-radius: 4px;
				border-bottom-right-radius: 4px;
				.login-main {
					margin: 0 auto;
					width: 70%;
					.login-title {
						color: var(--prev-color-text-primary);
						margin-bottom: 40px;
						font-weight: 500;
						font-size: 22px;
						text-align: center;
						letter-spacing: 4px;
					}
					.login-form {
						margin: 10px 0;
						i {
							color: var(--prev-color-text-primary);
						}
						.el-form-item {
							margin-bottom: 20px !important;
							.login-code {
								display: flex;
								align-items: center;
								justify-content: space-around;
								margin: 0 0 0 10px;
								user-select: none;
								.login-code-img {
									margin-top: 2px;
									width: 100px;
									height: 38px;
									border: 1px solid var(--prev-border-color-base);
									color: var(--prev-color-text-primary);
									font-size: 14px;
									font-weight: 700;
									letter-spacing: 5px;
									line-height: 38px;
									text-indent: 5px;
									text-align: center;
									cursor: pointer;
									transition: all ease 0.2s;
									border-radius: 4px;
									&:hover {
										border-color: var(--prev-border-color-hover);
										transition: all ease 0.2s;
									}
								}
							}
							.login-submit {
								width: 100%;
								letter-spacing: 2px;
							}
						}
					}
					.login-menu {
						margin-top: 30px;
						width: 100%;
						text-align: left;
						a {
							color: var(--prev-color-text-secondary);
							font-size: 12px;
							margin: 0 8px;
							text-decoration: none;
							&:hover {
								color: var(--prev-color-primary);
								text-decoration: underline;
							}
						}
					}
				}
			}
		}
	}
	.w3_info h2 {
		display: inline-block;
		font-size: 26px;
		margin-bottom: 10px;
		color: #3eb991;
		letter-spacing: 2px;
	}
	.login-code {
		display: flex;
		align-items: center;
		justify-content: space-around;
		margin: 0 0 0 10px;
		user-select: none;
		.login-code-img {
			margin-top: 2px;
			width: 100px;
			height: 38px;
			border: 1px solid var(--prev-border-color-base);
			color: var(--prev-color-text-primary);
			font-size: 14px;
			font-weight: 700;
			letter-spacing: 5px;
			line-height: 38px;
			text-indent: 5px;
			text-align: center;
			cursor: pointer;
			transition: all ease 0.2s;
			border-radius: 4px;
			&:hover {
				border-color: var(--prev-border-color-hover);
				transition: all ease 0.2s;
			}
		}
	}
	.login-submit {
		width: 100%;
		letter-spacing: 2px;
	}
</style>
