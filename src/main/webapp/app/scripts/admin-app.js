/**
 * 页面总入口，定义依赖的第三方库，定义共有方法，变量
 * @author wengwh
 */
(function() {
	'use strict';

	angular.module('stockApp', ['ngAnimate', 'ngCookies',
	  'ngSanitize', 'ui.router', 'ngMaterial', 'nvd3', 'md.data.table','ngMdIcons','ngDatetimePicker'])
	  
	  .run(function($rootScope, $mdToast,$mdDialog, $state, $timeout, RestService, contextRoot, restUrl) {
	  		$rootScope.contextRoot = contextRoot;
				$rootScope.restUrl = restUrl;
				$rootScope.RestService = RestService(contextRoot);
				$rootScope.$state = $state;
				$rootScope.progressNum = 0;
		    
		    $rootScope.showProgress = function (msg) {
		      $rootScope.progressNum++;
		      if (msg) {
		        $rootScope.showMsg(msg);
		      }
		    };

		    $rootScope.hideProgress = function (msg, isFail) {
		      $rootScope.progressNum--;
		      if (msg) {
		        if (isFail && isFail==true) {
		          $rootScope.showErrorMsg(msg);
		        } else {
		          $rootScope.showMsg(msg);
		        }
		      }
		    };
				
		    $rootScope.showErrorMsg = function (msg) {
		      $rootScope.showMsg(msg, 3000, 'md-toast-error');
		    };
		    
				$rootScope.showMsg = function(title,delay,className) {
		      $mdToast.show(
		        $mdToast.simple().toastClass(className) 
		          .content(title)
		          .hideDelay(delay?delay:1000)
		          .position('bottom right')
		      );
		    };
		    
		    $rootScope.confirmDialog = function(args) {
		    	$mdDialog.show({
		        templateUrl: 'views/confirm-dialog.html',
		        controller: function($scope, $mdDialog) {
            	$scope.title = angular.copy(args.title);
            	$scope.content = angular.copy(args.content);
		          $scope.cancel = function(){
		            $mdDialog.hide();
              	args.confirm(false);
              };
              $scope.ok = function(){
		            $mdDialog.hide();
              	args.confirm(true);
              };
		        }
		    	 });
		    };
					
		    $rootScope.getDateTime =function(day){
	        var m = moment();
		    	if(day){
		        return moment(m).add(day, 'days').format('YYYY-MM-DD HH:mm:ss')
		    	}else{
		    		return m.format('YYYY-MM-DD HH:mm:ss')
		    	}
		    };
		    
		    $rootScope.tableOptions = {
	    		rowSelection: true,
	        multiSelect: true,
	        autoSelect: true,
	        pageSelect: true,
	        limitOptions:[10,50,100],
	        label:{page: '当前页数:', rowsPerPage: '每页显示:', of: 'of'}
      	};
		    
		    $rootScope.windowExportExcel = function(data,fileNamePre){
		    	$rootScope.showProgress();
					// 加入定时跳出angular本身的检查
		    	$timeout(function() {
						var fileName = decodeURI(fileNamePre+'.xls');
						var url = URL.createObjectURL(new Blob([ data ]));
						var a = document.createElement('a');
						document.body.appendChild(a); // 此处增加了将创建的添加到body当中
						a.href = url;
						a.download = fileName;
						a.target = '_blank';
						a.click();
						a.remove(); // 将a标签移除
						$rootScope.hideProgress();
					}, 1000);
		    };
		});

})();