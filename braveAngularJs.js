const app = angular.module("toDoList", []);
app.controller("toDoListCtrl", ['$scope', '$window', function ($scope, $window) {
    ////全域變數及函數
    //////variables
    $scope.myDate = myDate;
    $scope.hasDragged = false;
    //////functions
    $scope.getHourSecondFromStr = getHourSecondFromStr;
    $scope.getHourSecondFromTime = getHourSecondFromTime;
    $scope.dropAllFloatWindow = function () {
        for (tag of document.querySelectorAll('form.middleFloat')) {
            if (+window.getComputedStyle(tag)['zIndex'] >= 0) {
                tag.style.display = 'none';
            }
        }
        document.querySelector('div.fullScreen').style.display = 'none';
        $scope.showSet = {};
        $scope.newItem = undefined;
        $scope.newTime = undefined;
    }


    ////更改日期時重新傳進資料功能
    //////function
    $scope.changeDate = function () {

        $scope.dataTimeline = [];
        $scope.dataList = [];
        $scope.beforeTimeList = true;
        $scope.beforeTimeList = true;
        api.getMyData($scope.myDate)
            .then(res => {
                if (res.dataTimeline.length) {
                    $scope.$apply(function () { $scope.dataTimeline = $scope.dataTimelineOg = res.dataTimeline })
                }
                if (res.dataList.length) {
                    $scope.$apply(function () { $scope.dataList = $scope.dataListOg = res.dataList })
                }
                $scope.showSet = {};
            })
            .then(() => {
                $scope.$apply(function () { $scope.beforeTimeList = false; })
            }
            )
    }


    ////各代辦項目的更正視窗
    //////variables
    //紀錄要展開哪個代辦項目更正視窗的集合
    $scope.showSet = {};
    //////functions

    $scope.myClick = function (showGroup, index = '0') {
        if (!(showGroup in $scope.showSet) || !(index in $scope.showSet[showGroup])) {
            $scope.showSet[showGroup][index] = false;
        }

        $scope.showSet[showGroup][index] = true;
        document.querySelector('div.fullScreen').style.display = '';
    }
    $scope.showMe = function (showGroup, index) {
        if (!(showGroup in $scope.showSet)) {
            $scope.showSet[showGroup] = { index: false }
        }
        return $scope.showSet[showGroup][index] ? '' : 'none';
    };
    //記錄代辦項目是否完成或取消完成
    $scope.toggleDo = function (dataset, timeOrOrder, event) {
        let goal;
        if (dataset == 'dataTimeline') {
            goal = $scope.dataTimeline.find(rowData => {
                return rowData.time == timeOrOrder
            })
        }
        if (dataset == 'dataList') {
            goal = $scope.dataList.find(rowData => {
                return rowData.order == timeOrOrder
            })
        }
        //當drag有移動過時，不觸發check改變
        if (event && event.target.closest('.draggable').classList.contains('dragged')) {
            event.target.closest('.draggable').classList.remove('dragged');
            return
        }
        goal.check = goal.check == 'Y' ? 'N' : 'Y';
    }



    ////新增項目視窗
    //////functions
    $scope.addNewWindow = function () {
        document.querySelector('#outerForm').style.display = '';
        document.querySelector('div.fullScreen').style.display = '';
    }
    $scope.addNewData = function () {
        if ($scope.hasTime == 'Y') {
            const formatTime = getHourSecondFromTime($scope.newTime);
            const found = $scope.dataTimeline.find(element => element.time == formatTime);
            if (found) {
                found.item = found.item + '\n' + $scope.newItem;
            } else {
                $scope.dataTimeline.push({ time: formatTime, item: $scope.newItem, check: 'N' });
            }
        } else if ($scope.hasTime == 'N') {
            $scope.dataList.push({ order: $scope.dataList.length + 1, item: $scope.newItem, check: 'N' });
        }
        $scope.dropAllFloatWindow();
    }
    ////傳送資料按鈕功能
    //////variables
    $scope.sending = false;
    //////functions
    $scope.sendMyData = function () {
        if (!confirm('是否送出?')) return;
        $scope.sending = true;
        const data = {
            condition: 'receive',
            myDate: $scope.myDate,
            dataTimeline: $scope.dataTimeline,
            dataList: $scope.dataList
        }
        api.sendMyData(data)
            .then(() => { $scope.$applyAsync(() => $scope.sending = false); return true })
            .then(() => {
                $scope.dataTimelineOg = $scope.dataTimeline;
                $scope.dataListOg = $scope.dataList;
            });
    }

    /////還原頁面資料
    //////functions
    $scope.resetAll = function () {
        $scope.$applyAsync(function () {
            $scope.dataTimeline = $scope.dataTimelineOg;
            $scope.dataList = $scope.dataListOg;
        });
    }
    ////多筆刪除功能
    //////variables
    $scope.deleteMode = 'N';
    $scope.deleteSet = { dataTimeline: [], dataList: [] }
    //////functions
    $scope.toggleDeleteMode = function (deleteConfirm) {
        $scope.deleteMode = $scope.deleteMode == 'N' ? 'Y' : 'N';
        setTimeout(() => {
            $scope.$applyAsync(function () {

                if (deleteConfirm) {

                    $scope.dataTimeline = $scope.dataTimeline.filter(element => {
                        return !(('delete' in element) && element.delete == 'Y')
                    })

                    $scope.dataList = $scope.dataList.filter(element => {
                        return !(('delete' in element) && element.delete == 'Y')
                    })
                }
                for (obj of $scope.dataTimeline) {
                    obj.delete = 'N'
                }
                for (obj of $scope.dataList) {
                    obj.delete = 'N'
                }
                $scope.deleteSet = { dataTimeline: [], dataList: [] };

            }
            )
        }, 300)

    }
    $scope.toggleDelete = function (dataset, timeOrOrder) {

        let goal;
        if (dataset == 'dataTimeline') {
            goal = $scope.dataTimeline.find(rowData => {
                return rowData.time == timeOrOrder
            })
        }
        if (dataset == 'dataList') {
            goal = $scope.dataList.find(rowData => {
                return rowData.order == timeOrOrder
            })
        }
        if (!('delete' in goal)) {
            goal.delete = 'N'
        }
        goal.delete = goal.delete == 'Y' ? 'N' : 'Y';
    }

    ////拖曳功能
    //////functions
    $scope.dragHandler = dragHandler;

    ////針對無時間項目更改功能
    //////functions
    $scope.updateToListOrTimeline = function (data, timeChange, updateTime, updateItem) {
        updateItem = updateItem == undefined ? data.item : updateTime;
        if (!timeChange) {
            data.item = updateItem == undefined ? data.item : updateItem;
            data.order = Object.values(data).length + 1;
        } else {
            const formatTime = getHourSecondFromTime(updateTime);
            const found = $scope.dataTimeline.find(element => element.time == formatTime);
            if (found) {
                found.item = found.item + '\n' + updateItem;
            } else {
                $scope.dataTimeline.push({ time: formatTime, item: updateItem, check: 'N' });
            }
            data.delete = 'Y'
            $scope.$applyAsync(function () {
                $scope.dataList = $scope.dataList.filter(element => {
                    return !(('delete' in element) && element.delete == 'Y')
                })
            });
        }
        $scope.dropAllFloatWindow();
    }


    ////初始執行
    $scope.changeDate();

    ////EVENT
    /*
    $window.addEventListener('click', function (event) {
        if (window.getComputedStyle(event.target)['zIndex'] == 1) {
            $scope.dropAllFloatWindow();
        }
    })
    */

    //////
    $scope.touched = false;

    $scope.touchStart = function () {
        $scope.touched = true;
    }

    $scope.touchEnd = function () {
        $scope.touched = false;
    }

}]);
