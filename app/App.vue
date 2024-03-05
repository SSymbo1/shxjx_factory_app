<script>
	import {isOpened,sqlName,sqlPath,openDb,closeDb} from '@/static/js/sqlite_helper.js'
	import {initInventory,initQuotation} from '@/static/js/init_database.js'
	export default {
		onLaunch: function() {
			console.log('App Launch')
			if(!isOpened(sqlName,sqlPath)){
				openDb(sqlName,sqlPath)
			}
			initInventory().then(res=>{
				console.log('执行初始化数据库inventory');
			})
			initQuotation().then(res=>{
				console.log('执行初始化数据库quotation');
			})
			closeDb(sqlName)
		},
		onShow: function() {
			console.log('App Show')
			
		},
		onHide: function() {
			console.log('App Hide')
		},
		
	}
</script>

<style lang="scss">
	/*每个页面公共css */
	/* 注意要写在第一行，同时给style标签加入lang="scss"属性 */
		@import "uview-ui/index.scss";
</style>
