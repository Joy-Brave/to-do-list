function doGet(e) {
  const param=e.parameter;
  const myDate=new Date(param.myDate);
  const spreadsheet = SpreadsheetApp.openById("1FBqiw4jnVTgsxxiPvppWA8xk2_WznAQkH532s__ytH4");
  //也可以用spreadsheet.getSheetByName(your sheetname)
  const sheetTimeline=spreadsheet.getSheets().find(item=>item.getSheetName().toLowerCase()=='timeline');
  const sheetList=spreadsheet.getSheets().find(item=>item.getSheetName().toLowerCase()=='list');
  let data={
    dataTimeline:[],
    dataList:[],
  }
  const timelineData=myGetDataByDate(myDate,sheetTimeline);
  const listData=myGetDataByDate(myDate,sheetList);
  timelineData.forEach(rowData=>data.dataTimeline.push({time:rowData[1],item:rowData[2], check:rowData[3]}));
  listData.forEach(rowData=>data.dataList.push({order:rowData[1],item:rowData[2], check:rowData[3]}));
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}


function doPost(e) {
  /*
  e={{parameter:{
    condition:'receive',
    myDate:'2020-10-19',dataTimeline:[{time:'09:00', item:'吃飯', check:'N'}],dataList:[]
    }}:''}
  */
  Logger.log(e);
  const param=JSON.parse(Object.keys(e.parameter)[0]);
  const condition=param.condition;
  const myDate=new Date(param.myDate);
  const dataTimeline=param.dataTimeline;
  const dataList=param.dataList;
 
  
  
  const spreadsheet = SpreadsheetApp.openById("1FBqiw4jnVTgsxxiPvppWA8xk2_WznAQkH532s__ytH4");
  //也可以用spreadsheet.getSheetByName(your sheetname)
  const sheetTimeline=spreadsheet.getSheets().find(item=>item.getSheetName().toLowerCase()=='timeline');
  const sheetList=spreadsheet.getSheets().find(item=>item.getSheetName().toLowerCase()=='list');
  
  if (condition=='receive'){
    myDelRowsByDate(myDate, sheetTimeline);
    myDelRowsByDate(myDate, sheetList);
    myAddTimelineData(myDate, dataTimeline, sheetTimeline);
    myAddListData(myDate, dataList, sheetList);
    mySort(sheetTimeline);
    mySort(sheetList);
  }
  
  if (condition=='request'){
  
    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
  }
  
  return ContentService.createTextOutput(JSON.stringify(param)).setMimeType(ContentService.MimeType.JSON);
  
  //ContentService.createTextOutput(JSON.stringify(e)).setMimeType(ContentService.MimeType.JSON)
}

function myFindStartEndByDate(date,sheetName){
  const length=sheetName.getDataRange().getLastRow();
  let start=null;
  let end=null;
  const values=sheetName.getRange(1,1,length,1).getValues();
  for (let i=2;i<=length;i++){
    let value=new Date(values[i-1]);
    Logger.log(value);
    let bool=value.getFullYear()==date.getFullYear() && value.getMonth()==date.getMonth() && value.getDate()==date.getDate();
    if (start==null && bool) {
      start=i;
      end=i;
    }else if (start!=null && bool){
      end=i;
    }else if (start!=null && !bool) break;
  }
  if (start !=null) {
    return [start,end]
  }
  return [null,null]
}

function myGetDataByDate(date,sheetName){
  const width=sheetName.getDataRange().getLastColumn();
  const [start,end]=myFindStartEndByDate(date,sheetName);
  if (start!=null){
    return sheetName.getRange(start,1,end-start+1,width).getValues();
  }
  return []
}

function myDelRowsByDate(date,sheetName){
  const [start,end]=myFindStartEndByDate(date,sheetName);
  if (start !=null) {
    sheetName.deleteRows(start,end-start+1);
  }
}

function myAddTimelineData(date, dataArr, sheetName){
  for (let obj of dataArr){
    let arr=[date,obj.time,obj.item,obj.check];
    let lastRow=sheetName.getLastRow()+1;
    for (let j=1;j<=sheetName.getLastColumn();j++){
      let range=sheetName.getRange(lastRow,j,1,1);
      range.setValue(arr[j-1]);
    }
  }
}

function myAddListData(date, dataArr, sheetName){
  for (let obj of dataArr){
    let arr=[date,obj.order,obj.item,obj.check];
    let lastRow=sheetName.getLastRow()+1;
    for (let j=1;j<=sheetName.getLastColumn();j++){
      let range=sheetName.getRange(lastRow,j,1,1);
      range.setValue(arr[j-1]);
    }
  }
}


function mySort(sheetName){
  const range=sheetName.getDataRange();
  sheetName.getRange(2,1,range.getLastRow(),range.getLastColumn()).sort(2).sort({column:1, ascending:false});// 無法用sort(1,false)
}

function myGetTimeZoneTime(dateString){
  const date=new Date(dateString);
  const timeZone = Session.getScriptTimeZone();
  const string = Utilities.formatDate(date, timeZone, "yyyy-MM-dd");
  return new Date(string)
}
