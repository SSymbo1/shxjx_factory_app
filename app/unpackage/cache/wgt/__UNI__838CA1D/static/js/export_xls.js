import {
	openDb,
	closeDb,
	isOpened,
	sqlName,
	sqlPath
} from './sqlite_helper.js'
import {
	selectQuotationForCreateXls
} from './crud.js'
import * as XLSX from 'xlsx'

let data
export let fileNamePath=''

async function getQuotation() {
	if (!isOpened(sqlName, sqlPath)) {
		await openDb(sqlName, sqlPath)
	}
	let res = await selectQuotationForCreateXls()
	data = res
	await closeDb(sqlName)
}

function writeXlsxToFile(xlsxData, fileNamePath) {
    const File = plus.android.importClass('java.io.File')
	const Base64 = plus.android.importClass("android.util.Base64")
    const FileOutputStream = plus.android.importClass('java.io.FileOutputStream')
    try {
        const file = new File(fileNamePath)
        if (!file.exists()) {
            file.createNewFile() // 创建文件
        }
		let buffer=Base64.decode(xlsxData,Base64.DEFAULT) 
        const fos = new FileOutputStream(file)
		fos.write(buffer)
        fos.flush()
        fos.close()
        return true
    } catch (e) {
        console.log(e, '错误!')
        return false
    }
}

export async function xlsBulider() {
    try {
        await getQuotation()
        let sheet_name = '双兴机械加工厂报价单' + new Date().getTime()
		fileNamePath = '/storage/emulated/0/Download/' + sheet_name + '.xlsx'
        let sheet = XLSX.utils.json_to_sheet(data, { header: ["件名", "单价"] })
        let newSheet = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(newSheet, sheet, "Sheet1")
        let sheetBuffer = XLSX.write(newSheet, {type: 'base64',bookType:'xlsx'})
        let requestPermission = () => {
            return new Promise((resolve, reject) => {
                var permissions = ['android.permission.WRITE_EXTERNAL_STORAGE']
                plus.android.requestPermissions(permissions, function(result) {
                    if (result[0] === 'android.permission.WRITE_EXTERNAL_STORAGE' && result[1] === 'denied') {
                        reject('权限被拒绝!')
                    } else {
                        resolve()
                    }
                })
            })
        }
        await requestPermission()
		let success = writeXlsxToFile(sheetBuffer, fileNamePath)
        if (success) {
            console.log('xlsx 导出成功!路径为:'+fileNamePath)
        } else {
            console.log('xlsx 导出失败!')
        }
    } catch (e) {
        console.log("发生错误!" + e)
    }
}