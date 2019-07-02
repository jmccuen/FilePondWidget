TW.Runtime.Widgets.filepondwidget= function () {
	
	let thisWidget = this;
	thisWidget.pondId;
	let pond;
	let fileId = 0;
	let fileRef = {};

	this.renderHtml = function () {
		FilePond.registerPlugin(FilePondPluginFileMetadata);
		
		thisWidget.pondId = thisWidget.jqElementId + '-filepond';
		return 	'<div class="widget-content widget-filepondwidget">' +
				'<input id="' + thisWidget.pondId + '" type="file" class="filepond" name="filepond" multiple />' +
				'</div>';
	};
	
	this.updateProperty = function (updatePropertyInfo) {
		if (updatePropertyInfo.TargetProperty === 'Path') {
			thisWidget.setProperty('Path', updatePropertyInfo.SinglePropertyValue);
		}
		if (updatePropertyInfo.TargetProperty === 'RepositoryName') {
			thisWidget.setProperty('RepositoryName', updatePropertyInfo.SinglePropertyValue);
		}
	};
	

	this.afterRender = function () {
		
		let _uuid = getRandomUUID();
        let base_url = window.parent.location.protocol + "//" + window.parent.location.host;
        
        
        FilePond.setOptions({
        	allowRevert: false,
            server: {
                url: base_url,
                process: (fieldName, file, metadata, load, error, progress, abort) => {  
                	thisWidget.jqElement.triggerHandler('UploadStarted');

                	const formData = new FormData();
                	
                    formData.append('upload-path-' + _uuid, metadata.path);
                    formData.append('upload-repository-' + _uuid, metadata.repo);
                	formData.append('upload-files-' + _uuid, file, file.name);
                    formData.append('upload-path-' + _uuid,"Upload");
                   
                    const request = new XMLHttpRequest();
                    
                    request.open('POST', '/Thingworx/FileRepositoryUploader');
                    request.setRequestHeader("X-XSRF-TOKEN","TWX-XSRF-TOKEN-VALUE");
                    request.upload.onprogress = (e) => {
                        progress(e.lengthComputable, e.loaded, e.total);
                    };
                    request.onload = function() {
                        if (request.status >= 200 && request.status < 300) {
                            // the load method accepts either a string (id) or an object
                            load(request.responseText);
                        }
                        else {
                        	thisWidget.jqElement.triggerHandler('UploadFailed');
                        }
                    };

                    request.send(formData);

                    return {
                        abort: () => {
                            request.abort();
                            abort();
                        }
                    };
                },
                fetch: null,
                revert: null
            }
        });

        thisWidget.pond = FilePond.create(document.getElementById(thisWidget.pondId));

        thisWidget.pond.onaddfile = (err, item) => {
        	if (!err) {
	        	let path = thisWidget.getProperty("Path");
	        	if (path[path.length -1] !== "/") {
	        		path += "/";
	        	}
	        	let fullPath = path + item.file.name;
	        	item.setMetadata("repo",thisWidget.getProperty("RepositoryName"));
	        	item.setMetadata("path",path);
	        	item.setMetadata("fullPath",fullPath);
	        	item.setMetadata("deleted",false);
        	}
        }
        
        thisWidget.pond.onprocessfile = (err, item) => {
        	if (!err) {
        		let meta = item.getMetadata();
        		thisWidget.setProperty("FileName",item.name);
        		thisWidget.setProperty("FullPath",meta.fullPath);
        		thisWidget.jqElement.triggerHandler('UploadComplete');
        	}
        }
        
        
        thisWidget.pond.onprocessfileabort = (item) => {
        	
        	thisWidget.revertFile(item);
        }
	};
	
    this.revertFile = function(file) {
    	let base_url = window.parent.location.protocol + "//" + window.parent.location.host;
    	let meta = file.getMetadata();
		let repo = meta.repo;
		let path = meta.path;
		let fullPath = meta.fullPath;
		let data = {};
		data.path = fullPath;
		if (!meta.deleted) {
			$.ajax({
				  type: "POST",
				  headers: { "X-XSRF-TOKEN": "TWX-XSRF-TOKEN-VALUE" },
				  contentType: "application/json",
				  url: base_url + "/Thingworx/Things/" + repo + "/Services/DeleteFile?Accept=application%2Fjson-compressed&_twsr=1&Content-Type=application%2Fjson",
				  data: JSON.stringify(data),
				  processData: false,
				  success: null,
				  dataType: "json"
				});
			file.setMetadata("deleted",true);
		}
    }
	
	this.serviceInvoked = function (serviceName) {
		if (serviceName === 'AbortAll') {
			
			let files = thisWidget.pond.getFiles();
			for (let i = 0; i<files.length;i++) {
				let file = files[i];
				if (file.status === FilePond.FileStatus.PROCESSING) {
					thisWidget.revertFile(file);
					file.abortProcessing();
				}
				
			}
			
			thisWidget.jqElement.triggerHandler('AbortAllCompleted');
		};		
	};
	
};