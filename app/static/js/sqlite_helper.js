const sqlName = "factory"  //定义的数据库名称
const sqlPath = "_doc/factory.db"

//打开数据库，在使用数据库前，必须打开数据库
function openDb(name,path) {
    return new Promise((resolve,reject)=>{
        plus.sqlite.openDatabase({
            name: name,    //数据库的名称
            path: path,    
            success: function(e){
                console.log('数据库打开成功')
                resolve(e)
            },
            fail: function(e){
                console.log('数据库打开失败:' + JSON.stringify(e))
                reject(e)
            }
        })
    })
}

//判断是否打开数据库
function isOpened(name,path) {
    return plus.sqlite.isOpenDatabase({name:name,path:path})
}

//关闭数据库
function closeDb(name) {
    return new Promise((resolve,reject)=>{
        plus.sqlite.closeDatabase({
			 name: name,    //数据库的名称
            success: function(e){
                console.log('数据库关闭成功')
                resolve(e)
            },
            fail: function(e){
                console.log('数据库关闭失败')
                reject(e)
            }
		})
    })
}

//查询sql 所有的查询都用该方法
function selectSql(name,sqlText) {
    return new Promise((resolve,reject)=>{
        plus.sqlite.selectSql({
            name: name,    //数据库的名称
            sql: sqlText,
            success: function(e){
                console.log('查询成功:' + sqlText)
                resolve(e)
            },
            fail: function(e){
                console.log('查询失败:' + sqlText + "-异常信息:" + JSON.stringify(e))
                reject(e)
            }
        })
    })
}

//执行增删改查都使用该方法
function executeSql(name,sqlText) {
    return new Promise((resolve,reject)=>{
        plus.sqlite.executeSql({
            name: name,//数据库的名称
            sql: sqlText,
            success: function(e){
                console.log('操作成功')
                resolve(e)
            },
            fail: function(e){
                console.log('执行失败:' + sqlText + '-异常信息:' + JSON.stringify(e))
                reject(e)
            }
        })
    })
}

export {
	sqlName,
	sqlPath,
	openDb,
	isOpened,
	closeDb,
	selectSql,
	executeSql
}
