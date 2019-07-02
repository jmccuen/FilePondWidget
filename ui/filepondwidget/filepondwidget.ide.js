TW.IDE.Widgets.filepondwidget = function () {

	this.widgetIconUrl = function() {
		return  "'../Common/extensions/FilePondWidget/ui/filepondwidget/filepond.png'";
	};

	this.widgetProperties = function () {
		return {
			'name': 'FilePondWidget',
			'description': '',
			'category': ['Common','Data'],
			'supportsAutoResize': true,
			'properties': {
                'Width': {
                    'defaultValue': 300,
                    'isEditable': true,
                    'description': TW.IDE.I18NController.translate('tw.fileupload-ide.properties.width.description')
                },
                'Height': {
                    'defaultValue': 300,
                    'isEditable': true,
                    'description': TW.IDE.I18NController.translate('tw.fileupload-ide.properties.height.description')
                },
                'RepositoryName': {
                    'description': TW.IDE.I18NController.translate('tw.fileupload-ide.properties.repository-name.description'),
                    'isBindingTarget': true,
                    'isBindingSource': true,
                    'defaultValue': 'SystemRepository',
                    'baseType': 'THINGNAME',
                    'mustImplement':
                    { 
                        'EntityType': 'ThingTemplates',
                        'EntityName': 'FileRepository'
                    }
                },
                'Path': {
                    'description': TW.IDE.I18NController.translate('tw.fileupload-ide.properties.path.description'),
                    'isBindingTarget': true,
                    'isBindingSource': true,
                    'defaultValue': '/',
                    'baseType': 'STRING'
                },
                'FileName': {
                    'description': TW.IDE.I18NController.translate('tw.fileupload-ide.properties.file-name.description'),
                    'isBindingSource': true,
                    'defaultValue': '',
                    'baseType': 'STRING'
                },
                'FullPath': {
                    'description': TW.IDE.I18NController.translate('tw.fileupload-ide.properties.full-path.description'),
                    'isBindingSource': true,
                    'defaultValue': '',
                    'baseType': 'STRING'
                },
			}
		}
	};

	this.afterSetProperty = function (name, value) {
		var refreshHtml = false;
		switch (name) {
			case 'Style':
			case 'Alignment':
				refreshHtml = true;
				break;
			default:
				break;
		}
		return refreshHtml;
	};

	this.renderHtml = function () {
		// return any HTML you want rendered for your widget
		// If you want it to change depending on properties that the user
		// has set, you can use this.getProperty(propertyName).
		return 	'<div class="widget-content widget-filepondwidget">' +
					'<span class="filepondwidget-property">FilePond Widget</span>' +
				'</div>';
	};

	this.afterRender = function () {

	};
	
	this.widgetServices = function () {
	    return {
	        'AbortAll': { 'warnIfNotBound': false }
	    };
	};
	
    this.widgetEvents = function () {
        return {
            'UploadComplete': { 'warnIfNotBound': false },
            'UploadFailed': { 'warnIfNotBound': false },
            'UploadStarted': { 'warnIfNotBound': false },
            'AbortAllCompleted': { 'warnIfNotBound': false }
        };
    };

};