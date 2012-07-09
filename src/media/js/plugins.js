// jQuery Alert Dialogs Plugin
//
// Version 1.1
//
// Cory S.N. LaViska
// A Beautiful Site (http://abeautifulsite.net/)
// 14 May 2009
//
// Visit http://abeautifulsite.net/notebook/87 for more information
//
// Usage:
//		jAlert( message, [title, callback] )
//		jConfirm( message, [title, callback] )
//		jPrompt( message, [value, title, callback] )
// 
// History:
//
//		1.00 - Released (29 December 2008)
//
//		1.01 - Fixed bug where unbinding would destroy all resize events
//
// License:
// 
// This plugin is dual-licensed under the GNU General Public License and the MIT License and
// is copyright 2008 A Beautiful Site, LLC. 
//
(function($) {
	
	$.alerts = {
		
		// These properties can be read/written by accessing $.alerts.propertyName from your scripts at any time
		
		verticalOffset: -75,                // vertical offset of the dialog from center screen, in pixels
		horizontalOffset: 0,                // horizontal offset of the dialog from center screen, in pixels/
		repositionOnResize: true,           // re-centers the dialog on window resize
		overlayOpacity: .01,                // transparency level of overlay
		overlayColor: '#FFF',               // base color of overlay
		draggable: true,                    // make the dialogs draggable (requires UI Draggables plugin)
		okButton: '&nbsp;OK&nbsp;',         // text for the OK button
		cancelButton: '&nbsp;Cancel&nbsp;', // text for the Cancel button
		dialogClass: null,                  // if specified, this class will be applied to all dialogs
		
		// Public methods
		
		alert: function(message, title, callback) {
			if( title == null ) title = 'Alert';
			$.alerts._show(title, message, null, 'alert', function(result) {
				if( callback ) callback(result);
			});
		},
		
		confirm: function(message, title, callback) {
			if( title == null ) title = 'Confirm';
			$.alerts._show(title, message, null, 'confirm', function(result) {
				if( callback ) callback(result);
			});
		},
			
		prompt: function(message, value, title, callback) {
			if( title == null ) title = 'Prompt';
			$.alerts._show(title, message, value, 'prompt', function(result) {
				if( callback ) callback(result);
			});
		},
		
		// Private methods
		
		_show: function(title, msg, value, type, callback) {
			
			$.alerts._hide();
			$.alerts._overlay('show');
			
			$("BODY").append(
			  '<div id="popup_container">' +
			    '<h1 id="popup_title"></h1>' +
			    '<div id="popup_content">' +
			      '<div id="popup_message"></div>' +
				'</div>' +
			  '</div>');
			
			if( $.alerts.dialogClass ) $("#popup_container").addClass($.alerts.dialogClass);
			
			// IE6 Fix
			var pos = ($.browser.msie && parseInt($.browser.version) <= 6 ) ? 'absolute' : 'fixed'; 
			
			$("#popup_container").css({
				position: pos,
				zIndex: 99999,
				padding: 0,
				margin: 0
			});
			
			$("#popup_title").text(title);
			$("#popup_content").addClass(type);
			$("#popup_message").text(msg);
			$("#popup_message").html( $("#popup_message").text().replace(/\n/g, '<br />') );
			
			$("#popup_container").css({
				minWidth: $("#popup_container").outerWidth(),
				maxWidth: $("#popup_container").outerWidth()
			});
			
			$.alerts._reposition();
			$.alerts._maintainPosition(true);
			
			switch( type ) {
				case 'alert':
					$("#popup_message").after('<div id="popup_panel"><input type="button" value="' + $.alerts.okButton + '" id="popup_ok" /></div>');
					$("#popup_ok").click( function() {
						$.alerts._hide();
						callback(true);
					});
					$("#popup_ok").focus().keypress( function(e) {
						if( e.keyCode == 13 || e.keyCode == 27 ) $("#popup_ok").trigger('click');
					});
				break;
				case 'confirm':
					$("#popup_message").after('<div id="popup_panel"><input type="button" value="' + $.alerts.okButton + '" id="popup_ok" /> <input type="button" value="' + $.alerts.cancelButton + '" id="popup_cancel" /></div>');
					$("#popup_ok").click( function() {
						$.alerts._hide();
						if( callback ) callback(true);
					});
					$("#popup_cancel").click( function() {
						$.alerts._hide();
						if( callback ) callback(false);
					});
					$("#popup_ok").focus();
					$("#popup_ok, #popup_cancel").keypress( function(e) {
						if( e.keyCode == 13 ) $("#popup_ok").trigger('click');
						if( e.keyCode == 27 ) $("#popup_cancel").trigger('click');
					});
				break;
				case 'prompt':
					$("#popup_message").append('<br /><input type="text" size="30" id="popup_prompt" />').after('<div id="popup_panel"><input type="button" value="' + $.alerts.okButton + '" id="popup_ok" /> <input type="button" value="' + $.alerts.cancelButton + '" id="popup_cancel" /></div>');
					$("#popup_prompt").width( $("#popup_message").width() );
					$("#popup_ok").click( function() {
						var val = $("#popup_prompt").val();
						$.alerts._hide();
						if( callback ) callback( val );
					});
					$("#popup_cancel").click( function() {
						$.alerts._hide();
						if( callback ) callback( null );
					});
					$("#popup_prompt, #popup_ok, #popup_cancel").keypress( function(e) {
						if( e.keyCode == 13 ) $("#popup_ok").trigger('click');
						if( e.keyCode == 27 ) $("#popup_cancel").trigger('click');
					});
					if( value ) $("#popup_prompt").val(value);
					$("#popup_prompt").focus().select();
				break;
			}
			
			// Make draggable
			if( $.alerts.draggable ) {
				try {
					$("#popup_container").draggable({ handle: $("#popup_title") });
					$("#popup_title").css({ cursor: 'move' });
				} catch(e) { /* requires jQuery UI draggables */ }
			}
		},
		
		_hide: function() {
			$("#popup_container").remove();
			$.alerts._overlay('hide');
			$.alerts._maintainPosition(false);
		},
		
		_overlay: function(status) {
			switch( status ) {
				case 'show':
					$.alerts._overlay('hide');
					$("BODY").append('<div id="popup_overlay"></div>');
					$("#popup_overlay").css({
						position: 'absolute',
						zIndex: 99998,
						top: '0px',
						left: '0px',
						width: '100%',
						height: $(document).height(),
						background: $.alerts.overlayColor,
						opacity: $.alerts.overlayOpacity
					});
				break;
				case 'hide':
					$("#popup_overlay").remove();
				break;
			}
		},
		
		_reposition: function() {
			var top = (($(window).height() / 2) - ($("#popup_container").outerHeight() / 2)) + $.alerts.verticalOffset;
			var left = (($(window).width() / 2) - ($("#popup_container").outerWidth() / 2)) + $.alerts.horizontalOffset;
			if( top < 0 ) top = 0;
			if( left < 0 ) left = 0;
			
			// IE6 fix
			if( $.browser.msie && parseInt($.browser.version) <= 6 ) top = top + $(window).scrollTop();
			
			$("#popup_container").css({
				top: top + 'px',
				left: left + 'px'
			});
			$("#popup_overlay").height( $(document).height() );
		},
		
		_maintainPosition: function(status) {
			if( $.alerts.repositionOnResize ) {
				switch(status) {
					case true:
						$(window).bind('resize', $.alerts._reposition);
					break;
					case false:
						$(window).unbind('resize', $.alerts._reposition);
					break;
				}
			}
		}
		
	}
	
	// Shortuct functions
	jAlert = function(message, title, callback) {
		$.alerts.alert(message, title, callback);
	}
	
	jConfirm = function(message, title, callback) {
		$.alerts.confirm(message, title, callback);
	};
		
	jPrompt = function(message, value, title, callback) {
		$.alerts.prompt(message, value, title, callback);
	};
	
})(jQuery);/*
* File:        jquery.dataTables.editable.js
* Version:     1.3.
* Author:      Jovan Popovic 
* 
* Copyright 2010-2011 Jovan Popovic, all rights reserved.
*
* This source file is free software, under either the GPL v2 license or a
* BSD style license, as supplied with this software.
* 
* This source file is distributed in the hope that it will be useful, but 
* WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY 
* or FITNESS FOR A PARTICULAR PURPOSE. 
* 
* Parameters:
* @sUpdateURL                   	String      URL of the server-side page used for updating cell. Default value is "UpdateData".
* @sAddURL                      	String      URL of the server-side page used for adding new row. Default value is "AddData".
* @sDeleteURL                   	String      URL of the server-side page used to delete row by id. Default value is "DeleteData".
* @fnShowError                  	Function    function(message, action){...}  used to show error message. Action value can be "update", "add" or "delete".
* @sAddNewRowFormId             	String      Id of the form for adding new row. Default id is "formAddNewRow".
* @oAddNewRowFormOptions            Object	    Options that will be set to the "Add new row" dialog
* @sAddNewRowButtonId           	String      Id of the button for adding new row. Default id is "btnAddNewRow".
* @oAddNewRowButtonOptions		    Object	    Options that will be set to the "Add new" button
* @sAddNewRowOkButtonId         	String      Id of the OK button placed in add new row dialog. Default value is "btnAddNewRowOk".
* @oAddNewRowOkButtonOptions		Object	    Options that will be set to the Ok button in the "Add new row" form
* @sAddNewRowCancelButtonId     	String      Id of the Cancel button placed in add new row dialog. Default value is "btnAddNewRowCancel".
* @oAddNewRowCancelButtonOptions	Object	    Options that will be set to the Cancel button in the "Add new row" form
* @sDeleteRowButtonId           	String      Id of the button for adding new row. Default id is "btnDeleteRow".
* @oDeleteRowButtonOptions		    Object	    Options that will be set to the Delete button
* @sSelectedRowClass            	String      Class that will be associated to the selected row. Default class is "row_selected".
* @sReadOnlyCellClass           	String      Class of the cells that should not be editable. Default value is "read_only".
* @sAddDeleteToolbarSelector    	String      Selector used to identify place where add and delete buttons should be placed. Default value is ".add_delete_toolbar".
* @fnStartProcessingMode        	Function    function(){...} called when AJAX call is started. Use this function to add "Please wait..." message  when some button is pressed.
* @fnEndProcessingMode          	Function    function(){...} called when AJAX call is ended. Use this function to close "Please wait..." message.
* @aoColumns                    	Array       Array of the JEditable settings that will be applied on the columns
* @sAddHttpMethod               	String      Method used for the Add AJAX request (default is 'POST')
* @sDeleteHttpMethod            	String      Method used for the Delete AJAX request (default is 'POST')
* @fnOnDeleting                 	Function    function(tr, id, fnDeleteRow){...} Function called before row is deleted.
                                                    tr isJQuery object encapsulating row that will be deleted
                                                    id is an id of the record that will be deleted.
                                                    fnDeleteRow(id) callback function that should be called to delete row with id
                                                    returns true if plugin should continue with deleting row, false will abort delete.
* @fnOnDeleted                  	Function    function(status){...} Function called after delete action. Status can be "success" or "failure"
* @fnOnAdding                   	Function    function(){...} Function called before row is added.
                                                    returns true if plugin should continue with adding row, false will abort add.
* @fnOnNewRowPosted			        Function    function(data) Function that can override default function that is called when server-side sAddURL returns result
                                                    You can use this function to add different behaviour when server-side page returns result
* @fnOnAdded                    	Function    function(status){...} Function called after delete action. Status can be "success" or "failure"
* @fnOnEditing                  	Function    function(input){...} Function called before cell is updated.
                                                    input JQuery object wrapping the inut element used for editing value in the cell.
                                                    returns true if plugin should continue with sending AJAX request, false will abort update.
* @fnOnEdited                   	Function    function(status){...} Function called after edit action. Status can be "success" or "failure"
* @sEditorHeight                	String      Default height of the cell editors
* @sEditorWidth                 	String      Default width of the cell editors
* @oDeleteParameters                Object      Additonal objects added to the DELETE Ajax request
* @sIDToken                         String      Token in the add new row dialog that will be replaced with a returned id of the record that is created
*/
(function ($) {

    $.fn.makeEditable = function (options) {

        var iDisplayStart = 0;

        ///Utility function used to determine id of the cell
        //By default it is assumed that id is placed as an id attribute of <tr> that that surround the cell (<td> tag). E.g.:
        //<tr id="17">
        //  <td>...</td><td>...</td><td>...</td><td>...</td>
        //</tr>
        function fnGetCellID(cell) {
            return properties.fnGetRowID($(cell.parentNode));
        }

        ///Utility function used to set id of the new row
        //It is assumed that id is placed as an id attribute of <tr> that that surround the cell (<td> tag). E.g.:
        //<tr id="17">
        //  <td>...</td><td>...</td><td>...</td><td>...</td>
        //</tr>
        function _fnSetRowIDInAttribute(row, id) {
            row.attr("id", id);
        }

        //Utility function used to get id of the row
        //It is assumed that id is placed as an id attribute of <tr> that that surround the cell (<td> tag). E.g.:
        //<tr id="17">
        //  <td>...</td><td>...</td><td>...</td><td>...</td>
        //</tr>
        function _fnGetRowIDFromAttribute(row) {
            return row.attr("id");
        }

        //Utility function used to set id of the new row
        //It is assumed that id is placed as an id attribute of <tr> that that surround the cell (<td> tag). E.g.:
        //<tr>
        //  <td>17</td><td>...</td><td>...</td><td>...</td>
        //</tr>
        function _fnSetRowIDInFirstCell(row, id) {
            $("td:first", row).html(id);
        }

        //Utility function used to get id of the row
        //It is assumed that id is placed as an id attribute of <tr> that that surround the cell (<td> tag). E.g.:
        //<tr>
        //  <td>17</td><td>...</td><td>...</td><td>...</td>
        //</tr>
        function _fnGetRowIDFromFirstCell(row) {
            return $("td:first", row).html();
        }

        //Reference to the DataTable object
        var oTable;
        //Refences to the buttons used for manipulating table data
        var oAddNewRowButton, oDeleteRowButton, oConfirmRowAddingButton, oCancelRowAddingButton;
        //Reference to the form used for adding new data
        var oAddNewRowForm;

        //Plugin options
        var properties;

        /// Utility function that shows an error message
        ///@param errorText - text that should be shown
        ///@param action - action that was executed when error occured e.g. "update", "delete", or "add"
        function fnShowError(errorText, action) {
            alert(errorText);
        }

        //Utility function that put the table into the "Processing" state
        function fnStartProcessingMode() {
            if (oTable.fnSettings().oFeatures.bProcessing) {
                $(".dataTables_processing").css('visibility', 'visible');
            }
        }

        //Utility function that put the table in the normal state
        function fnEndProcessingMode() {
            if (oTable.fnSettings().oFeatures.bProcessing) {
                $(".dataTables_processing").css('visibility', 'hidden');
            }
        }

        var sOldValue, sNewCellValue, sNewCellDislayValue;
        //Utility function used to apply editable plugin on table cells
        function _fnApplyEditable(aoNodes) {
            if (properties.bDisableEditing)
                return;
            var oDefaultEditableSettings = {
                event: 'dblclick',
                "callback": function (sValue, settings) {
                    properties.fnEndProcessingMode();
                    var status = "";
                    if (sNewCellValue == sValue) {
                        var aPos = oTable.fnGetPosition(this);
                        oTable.fnUpdate(sNewCellDisplayValue, aPos[0], aPos[2]);
                        status = "success";
                    } else {
                        var aPos = oTable.fnGetPosition(this);
                        oTable.fnUpdate(sOldValue, aPos[0], aPos[2]);
                        properties.fnShowError(sValue, "update");
                        status = "failure";
                    }

                    properties.fnOnEdited(status, sOldValue, sNewCellDisplayValue, aPos[0], aPos[1], aPos[2]);
                    if (settings.fnOnCellUpdated != null) {
                        settings.fnOnCellUpdated(status, sValue, settings);
                    }
                    _fnSetDisplayStart();

                },
                "onsubmit": function (settings, original) {
                    var input = $("input,select,textarea", this);
                    sOldValue = original.revert;
                    sNewCellValue = $("input,select,textarea", $(this)).val();
                    if (input.length == 1) {
                        var oEditElement = input[0];
                        if (oEditElement.nodeName.toLowerCase() == "select" || oEditElement.tagName.toLowerCase() == "select")
                            sNewCellDisplayValue = $("option:selected", oEditElement).text(); //For select list use selected text instead of value for displaying in table
                        else
                            sNewCellDisplayValue = sNewCellValue;
                    }

                    if (!properties.fnOnEditing(input))
                        return false;
                    var x = settings;
                    if (settings.cssclass != null) {
                        input.addClass(settings.cssclass);
                        if (!input.valid() || 0 == input.valid())
                            return false;
                        else
                            return true;
                    }
                },
                "submitdata": function (value, settings) {
                    iDisplayStart = _fnGetDisplayStart();
                    properties.fnStartProcessingMode();
                    var id = fnGetCellID(this);
                    var rowId = oTable.fnGetPosition(this)[0];
                    var columnPosition = oTable.fnGetPosition(this)[1];
                    var columnId = oTable.fnGetPosition(this)[2];
                    var sColumnName = oTable.fnSettings().aoColumns[columnId].sName;
                    if (sColumnName == null || sColumnName == "")
                        sColumnName = oTable.fnSettings().aoColumns[columnId].sTitle;
                    return {
                        "id": id,
                        "rowId": rowId,
                        "columnPosition": columnPosition,
                        "columnId": columnId,
                        "columnName": sColumnName
                    };
                },
                "onerror": function () {
                    properties.fnEndProcessingMode();
                    properties.fnShowError("Cell cannot be updated(Server error)", "update");
                    properties.fnOnEdited("failure");
                },
                "height": properties.sEditorHeight,
                "width": properties.sEditorWidth
            };

            var cells = null;
            if (properties.aoColumns != null) {
                for (var i = 0; i < properties.aoColumns.length; i++) {
                    if (properties.aoColumns[i] != null) {
                        cells = $("td:nth-child(" + (i + 1) + ")", aoNodes);
                        var oColumnSettings = oDefaultEditableSettings;
                        oColumnSettings = $.extend({}, oDefaultEditableSettings, properties.aoColumns[i]);
                        var sUpdateURL = properties.sUpdateURL;
                        try {
                            if (oColumnSettings.sUpdateURL != null)
                                sUpdateURL = oColumnSettings.sUpdateURL;
                        } catch (ex) {
                        }
                        cells.editable(sUpdateURL, oColumnSettings);
                    }


                }
            } else {
                cells = $('td:not(.' + properties.sReadOnlyCellClass + ')', aoNodes);
                cells.editable(properties.sUpdateURL, oDefaultEditableSettings);

            }

        }

        //Called when user confirm that he want to add new record
        function _fnOnRowAdding(event) {
            if (properties.fnOnAdding()) {
                if (oAddNewRowForm.valid()) {
                    iDisplayStart = _fnGetDisplayStart();
                    properties.fnStartProcessingMode();
                    var params = oAddNewRowForm.serialize();
                    $.ajax({ 'url': properties.sAddURL,
                        'data': params,
                        'type': properties.sAddHttpMethod,
                        "dataType": "text",
                        success: _fnOnRowAdded,
                        error: function (response) {
                            properties.fnEndProcessingMode();
                            properties.fnShowError(response.responseText, "add");
                            properties.fnOnAdded("failure");
                        }
                    });
                }
            }
            event.stopPropagation();
            event.preventDefault();
        }

        function _fnOnNewRowPosted(data) {

            return true;

        }
        ///Event handler called when a new row is added and response is returned from server
        function _fnOnRowAdded(data) {
            properties.fnEndProcessingMode();

            if (properties.fnOnNewRowPosted(data)) {

                var oSettings = oTable.fnSettings();
                var iColumnCount = oSettings.aoColumns.length;
                var values = new Array();

                $("input:text[rel],input:radio[rel][checked],input:hidden[rel],select[rel],textarea[rel],span.datafield[rel]", oAddNewRowForm).each(function () {
                    var rel = $(this).attr("rel");
                    var sCellValue = "";
                    if (rel >= iColumnCount)
                        properties.fnShowError("In the add form is placed input element with the name '" + $(this).attr("name") + "' with the 'rel' attribute that must be less than a column count - " + iColumnCount, "add");
                    else {
                        if (this.nodeName.toLowerCase() == "select" || this.tagName.toLowerCase() == "select")
                            sCellValue = $("option:selected", this).text();
                        else if (this.nodeName.toLowerCase() == "span" || this.tagName.toLowerCase() == "span")
                            sCellValue = $(this).html();
                        else
                            sCellValue = this.value;

                        sCellValue = sCellValue.replace(properties.sIDToken, data);
                        values[rel] = sCellValue;
                    }
                });

                //Add values from the form into the table
                var rtn = oTable.fnAddData(values);
                var oTRAdded = oTable.fnGetNodes(rtn);
                //Apply editable plugin on the cells of the table
                _fnApplyEditable(oTRAdded);
                //add id returned by server page as an TR id attribute
                properties.fnSetRowID($(oTRAdded), data);
                //Close the dialog
                oAddNewRowForm.dialog('close');
                $(oAddNewRowForm)[0].reset();
                $(".error", $(oAddNewRowForm)).html("");

                _fnSetDisplayStart();
                properties.fnOnAdded("success");
            }
        }

        //Called when user cancels adding new record in the popup dialog
        function _fnOnCancelRowAdding(event) {
            //Clear the validation messages and reset form
            $(oAddNewRowForm).validate().resetForm();  // Clears the validation errors
            $(oAddNewRowForm)[0].reset();

            $(".error", $(oAddNewRowForm)).html("");
            $(".error", $(oAddNewRowForm)).hide();  // Hides the error element

            //Close the dialog
            oAddNewRowForm.dialog('close');
            event.stopPropagation();
            event.preventDefault();
        }



        function _fnDisableDeleteButton() {
            if (properties.oDeleteRowButtonOptions != null) {
                //oDeleteRowButton.disable();
                oDeleteRowButton.button("option", "disabled", true);
            } else {
                oDeleteRowButton.attr("disabled", "true");
            }
        }

        function _fnEnableDeleteButton() {
            if (properties.oDeleteRowButtonOptions != null) {
                //oDeleteRowButton.enable();
                oDeleteRowButton.button("option", "disabled", false);
            } else {
                oDeleteRowButton.removeAttr("disabled");
            }
        }

        function _fnDeleteRow(id, sDeleteURL) {
            var sURL = sDeleteURL;
            if (sDeleteURL == null)
                sURL = properties.sDeleteURL;
            properties.fnStartProcessingMode();
            var data = $.extend(properties.oDeleteParameters, { "id": id });
            $.ajax({ 'url': sURL,
                'type': properties.sDeleteHttpMethod,
                'data': data,
                "success": _fnOnRowDeleted,
                "dataType": "text",
                "error": function (response) {
                    properties.fnEndProcessingMode();
                    properties.fnShowError(response.responseText, "delete");
                    properties.fnOnDeleted("failure");

                }
            });
        }

        //Called when user deletes a row
        function _fnOnRowDelete(event) {
            iDisplayStart = _fnGetDisplayStart();
            if ($('tr.' + properties.sSelectedRowClass + ' td', oTable).length == 0) {
                //oDeleteRowButton.attr("disabled", "true");
                _fnDisableDeleteButton();
                return;
            }
            var id = fnGetCellID($('tr.' + properties.sSelectedRowClass + ' td', oTable)[0]);
            if (properties.fnOnDeleting($('tr.' + properties.sSelectedRowClass, oTable), id, _fnDeleteRow)) {
                _fnDeleteRow(id);
            }
        }

        //Called when record is deleted on the server
        function _fnOnRowDeleted(response) {
            properties.fnEndProcessingMode();
            var oTRSelected = $('tr.' + properties.sSelectedRowClass, oTable)[0];
            if (response == "ok" || response == "") {
                oTable.fnDeleteRow(oTRSelected);
                //oDeleteRowButton.attr("disabled", "true");
                _fnDisableDeleteButton();
                _fnSetDisplayStart();
                properties.fnOnDeleted("success");
            }
            else {
                properties.fnShowError(response, "delete");
                properties.fnOnDeleted("failure");
            }
        }

        //Called before row is deleted
        //Returning false will abort delete
        /*
        * Function called before row is deleted
        * @param    tr  JQuery wrapped around the TR tag that will be deleted
        * @param    id  id of the record that wil be deleted
        * @return   true if plugin should continue with deleting row, false will abort delete.
        */
        function fnOnDeleting(tr, id, fnDeleteRow) {
            return confirm("Are you sure that you want to delete this record?"); ;
        }

        /* Function called after delete action
        * @param    result  string 
        *           "success" if row is actually deleted 
        *           "failure" if delete failed
        * @return   void
        */
        function fnOnDeleted(result) { }

        function fnOnEditing(input) { return true; }
        function fnOnEdited(result, sOldValue, sNewValue, iRowIndex, iColumnIndex, iRealColumnIndex) {

        }

        function fnOnAdding() { return true; }
        function fnOnAdded(result) { }

        var oSettings;
        function _fnGetDisplayStart() {
            return oSettings._iDisplayStart;
        }

        function _fnSetDisplayStart() {
            if (oSettings.oFeatures.bServerSide === false) {
                oSettings._iDisplayStart = iDisplayStart;
                oSettings.oApi._fnCalculateEnd(oSettings);
                //draw the 'current' page
                oSettings.oApi._fnDraw(oSettings);
            }
        }


        oTable = this;

        var defaults = {

            sUpdateURL: "UpdateData",
            sAddURL: "AddData",
            sDeleteURL: "DeleteData",
            sAddNewRowFormId: "formAddNewRow",
            oAddNewRowFormOptions: { autoOpen: false, modal: true },
            sAddNewRowButtonId: "btnAddNewRow",
            oAddNewRowButtonOptions: null,
            sAddNewRowOkButtonId: "btnAddNewRowOk",
            sAddNewRowCancelButtonId: "btnAddNewRowCancel",
            oAddNewRowOkButtonOptions: { label: "Ok" },
            oAddNewRowCancelButtonOptions: { label: "Cancel" },
            sDeleteRowButtonId: "btnDeleteRow",
            oDeleteRowButtonOptions: null,
            sSelectedRowClass: "row_selected",
            sReadOnlyCellClass: "read_only",
            sAddDeleteToolbarSelector: ".add_delete_toolbar",
            fnShowError: fnShowError,
            fnStartProcessingMode: fnStartProcessingMode,
            fnEndProcessingMode: fnEndProcessingMode,
            aoColumns: null,
            fnOnDeleting: fnOnDeleting,
            fnOnDeleted: fnOnDeleted,
            fnOnAdding: fnOnAdding,
            fnOnNewRowPosted: _fnOnNewRowPosted,
            fnOnAdded: fnOnAdded,
            fnOnEditing: fnOnEditing,
            fnOnEdited: fnOnEdited,
            sAddHttpMethod: 'POST',
            sDeleteHttpMethod: 'POST',
            fnGetRowID: _fnGetRowIDFromAttribute,
            fnSetRowID: _fnSetRowIDInAttribute,
            sEditorHeight: "100%",
            sEditorWidth: "100%",
            bDisableEditing: false,
            oDeleteParameters: {},
            sIDToken: "DATAROWID"

        };

        properties = $.extend(defaults, options);
        oSettings = oTable.fnSettings();

        return this.each(function () {

            if (oTable.fnSettings().sAjaxSource != null) {
                oTable.fnSettings().aoDrawCallback.push({
                    "fn": function () {
                        //Apply jEditable plugin on the table cells
                        _fnApplyEditable(oTable.fnGetNodes());
                        $(oTable.fnGetNodes()).each(function () {
                            var position = oTable.fnGetPosition(this);
                            var id = oTable.fnGetData(position)[0];
                            properties.fnSetRowID($(this), id);
                        }
                        );
                    },
                    "sName": "fnApplyEditable"
                });

            } else {
                //Apply jEditable plugin on the table cells
                _fnApplyEditable(oTable.fnGetNodes());
            }

            //Setup form to open in dialog
            oAddNewRowForm = $("#" + properties.sAddNewRowFormId);
            if (oAddNewRowForm.length != 0) {
                if (properties.oAddNewRowFormOptions != null) {
                    properties.oAddNewRowFormOptions.autoOpen = false;
                } else {
                    properties.oAddNewRowFormOptions = { autoOpen: false };
                }
                oAddNewRowForm.dialog(properties.oAddNewRowFormOptions);

                //Add button click handler on the "Add new row" button
                oAddNewRowButton = $("#" + properties.sAddNewRowButtonId);
                if (oAddNewRowButton.length != 0) {
                    oAddNewRowButton.click(function () {
                        oAddNewRowForm.dialog('open');
                    });
                } else {
                    if ($(properties.sAddDeleteToolbarSelector).length == 0) {
                        throw "Cannot find a button with an id '" + properties.sAddNewRowButtonId + "', od placeholder with an id '" + properties.sAddDeleteToolbarSelector + "' that should be used for adding new row although form for adding new record is specified";
                    } else {
                        oAddNewRowButton = null; //It will be auto-generated later
                    }
                }

                //Prevent Submit handler
                if (oAddNewRowForm[0].nodeName.toLowerCase() == "form") {
                    oAddNewRowForm.unbind('submit');
                    oAddNewRowForm.submit(function (event) {
                        _fnOnRowAdding(event);
                        return false;
                    });
                } else {
                    $("form", oAddNewRowForm[0]).unbind('submit');
                    $("form", oAddNewRowForm[0]).submit(function (event) {
                        _fnOnRowAdding(event);
                        return false;
                    });
                }

                // array to add default buttons to
                var aAddNewRowFormButtons = [];

                oConfirmRowAddingButton = $("#" + properties.sAddNewRowOkButtonId, oAddNewRowForm);
                if (oConfirmRowAddingButton.length == 0) {
                    //If someone forgotten to set the button text
                    if (properties.oAddNewRowOkButtonOptions.text == null
                        || properties.oAddNewRowOkButtonOptions.text == "") {
                        properties.oAddNewRowOkButtonOptions.text = "Ok";
                    }
                    properties.oAddNewRowOkButtonOptions.click = _fnOnRowAdding;
                    properties.oAddNewRowOkButtonOptions.id = properties.sAddNewRowOkButtonId;
                    // push the add button onto the array
                    aAddNewRowFormButtons.push(properties.oAddNewRowOkButtonOptions);
                } else {
                    oConfirmRowAddingButton.click(_fnOnRowAdding);
                }

                oCancelRowAddingButton = $("#" + properties.sAddNewRowCancelButtonId);
                if (oCancelRowAddingButton.length == 0) {
                    //If someone forgotten to the button text
                    if (properties.oAddNewRowCancelButtonOptions.text == null
                        || properties.oAddNewRowCancelButtonOptions.text == "") {
                        properties.oAddNewRowCancelButtonOptions.text = "Cancel";
                    }
                    properties.oAddNewRowCancelButtonOptions.click = _fnOnCancelRowAdding;
                    properties.oAddNewRowCancelButtonOptions.id = properties.sAddNewRowCancelButtonId;
                    // push the cancel button onto the array
                    aAddNewRowFormButtons.push(properties.oAddNewRowCancelButtonOptions);
                } else {
                    oCancelRowAddingButton.click(_fnOnCancelRowAdding);
                }
                // if the array contains elements, add them to the dialog
                if (aAddNewRowFormButtons.length > 0) {
                    oAddNewRowForm.dialog('option', 'buttons', aAddNewRowFormButtons);
                }
                //Issue: It cannot find it with this call:
                //oConfirmRowAddingButton = $("#" + properties.sAddNewRowOkButtonId, oAddNewRowForm);
                //oCancelRowAddingButton = $("#" + properties.sAddNewRowCancelButtonId, oAddNewRowForm);
                oConfirmRowAddingButton = $("#" + properties.sAddNewRowOkButtonId);
                oCancelRowAddingButton = $("#" + properties.sAddNewRowCancelButtonId);
            } else {
                oAddNewRowForm = null;
            }

            //Set the click handler on the "Delete selected row" button
            oDeleteRowButton = $('#' + properties.sDeleteRowButtonId);
            if (oDeleteRowButton.length != 0)
                oDeleteRowButton.click(_fnOnRowDelete);
            else {
                oDeleteRowButton = null;
            }

            //If an add and delete buttons does not exists but Add-delete toolbar is specificed
            //Autogenerate these buttons
            oAddDeleteToolbar = $(properties.sAddDeleteToolbarSelector);
            if (oAddDeleteToolbar.length != 0) {
                if (oAddNewRowButton == null && properties.sAddNewRowButtonId != ""
                    && oAddNewRowForm != null) {
                    oAddDeleteToolbar.append("<button id='" + properties.sAddNewRowButtonId + "' class='add_row'>Add</button>");
                    oAddNewRowButton = $("#" + properties.sAddNewRowButtonId);
                    oAddNewRowButton.click(function () { oAddNewRowForm.dialog('open'); });
                }
                if (oDeleteRowButton == null && properties.sDeleteRowButtonId != "") {
                    oAddDeleteToolbar.append("<button id='" + properties.sDeleteRowButtonId + "' class='delete_row'>Delete</button>");
                    oDeleteRowButton = $("#" + properties.sDeleteRowButtonId);
                    oDeleteRowButton.click(_fnOnRowDelete);
                }
            }

            //If delete button exists disable it until some row is selected
            if (oDeleteRowButton != null) {
                if (properties.oDeleteRowButtonOptions != null) {
                    oDeleteRowButton.button(properties.oDeleteRowButtonOptions);
                }
                _fnDisableDeleteButton();
            }

            //If add button exists convert it to the JQuery-ui button
            if (oAddNewRowButton != null) {
                if (properties.oAddNewRowButtonOptions != null) {
                    oAddNewRowButton.button(properties.oAddNewRowButtonOptions);
                }
            }


            //If form ok button exists convert it to the JQuery-ui button
            if (oConfirmRowAddingButton != null) {
                if (properties.oAddNewRowOkButtonOptions != null) {
                    oConfirmRowAddingButton.button(properties.oAddNewRowOkButtonOptions);
                }
            }

            //If form cancel button exists convert it to the JQuery-ui button
            if (oCancelRowAddingButton != null) {
                if (properties.oAddNewRowCancelButtonOptions != null) {
                    oCancelRowAddingButton.button(properties.oAddNewRowCancelButtonOptions);
                }
            }

            //Add handler to the inline delete buttons
            $(".table-action-deletelink", oTable).live("click", function (e) {

                    e.preventDefault();
                    e.stopPropagation();
                    var sURL = $(this).attr("href");

                    if (sURL == null || sURL == "")
                        sURL = properties.sDeleteURL;

                    iDisplayStart = _fnGetDisplayStart();
                    var oTD = ($(this).parents('td'))[0];
                    var oTR = ($(this).parents('tr'))[0];

                    $(oTR).addClass(properties.sSelectedRowClass);

                    var id = fnGetCellID(oTD);
                    if (properties.fnOnDeleting(oTD, id, _fnDeleteRow)) {
                        _fnDeleteRow(id, sURL);
                    }


                }
            );

            //Set selected class on row that is clicked
            //Enable delete button if row is selected, disable delete button if selected class is removed
            $("tbody", oTable).click(function (event) {
                if ($(event.target.parentNode).hasClass(properties.sSelectedRowClass)) {
                    $(event.target.parentNode).removeClass(properties.sSelectedRowClass);
                    if (oDeleteRowButton != null) {
                        _fnDisableDeleteButton();
                    }
                } else {
                    $(oTable.fnSettings().aoData).each(function () {
                        $(this.nTr).removeClass(properties.sSelectedRowClass);
                    });
                    $(event.target.parentNode).addClass(properties.sSelectedRowClass);
                    if (oDeleteRowButton != null) {
                        _fnEnableDeleteButton();
                    }
                }
            });



        });
    };
})(jQuery);/*
* File:        jquery.dataTables.min.js
* Version:     1.7.5
* Author:      Allan Jardine (www.sprymedia.co.uk)
* Info:        www.datatables.net
* 
* Copyright 2008-2010 Allan Jardine, all rights reserved.
*
* This source file is free software, under either the GPL v2 license or a
* BSD style license, as supplied with this software.
* 
* This source file is distributed in the hope that it will be useful, but 
* WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY 
* or FITNESS FOR A PARTICULAR PURPOSE. See the license files for details.
*/
(function (j, qa, p) {
    j.fn.dataTableSettings = []; var D = j.fn.dataTableSettings; j.fn.dataTableExt = {}; var n = j.fn.dataTableExt; n.sVersion = "1.7.5"; n.sErrMode = "alert"; n.iApiIndex = 0; n.oApi = {}; n.afnFiltering = []; n.aoFeatures = []; n.ofnSearch = {}; n.afnSortData = []; n.oStdClasses = { sPagePrevEnabled: "paginate_enabled_previous", sPagePrevDisabled: "paginate_disabled_previous", sPageNextEnabled: "paginate_enabled_next", sPageNextDisabled: "paginate_disabled_next", sPageJUINext: "", sPageJUIPrev: "", sPageButton: "paginate_button", sPageButtonActive: "paginate_active",
        sPageButtonStaticDisabled: "paginate_button", sPageFirst: "first", sPagePrevious: "previous", sPageNext: "next", sPageLast: "last", sStripOdd: "odd", sStripEven: "even", sRowEmpty: "dataTables_empty", sWrapper: "dataTables_wrapper", sFilter: "dataTables_filter", sInfo: "dataTables_info", sPaging: "dataTables_paginate paging_", sLength: "dataTables_length", sProcessing: "dataTables_processing", sSortAsc: "sorting_asc", sSortDesc: "sorting_desc", sSortable: "sorting", sSortableAsc: "sorting_asc_disabled", sSortableDesc: "sorting_desc_disabled",
        sSortableNone: "sorting_disabled", sSortColumn: "sorting_", sSortJUIAsc: "", sSortJUIDesc: "", sSortJUI: "", sSortJUIAscAllowed: "", sSortJUIDescAllowed: "", sSortJUIWrapper: "", sScrollWrapper: "dataTables_scroll", sScrollHead: "dataTables_scrollHead", sScrollHeadInner: "dataTables_scrollHeadInner", sScrollBody: "dataTables_scrollBody", sScrollFoot: "dataTables_scrollFoot", sScrollFootInner: "dataTables_scrollFootInner", sFooterTH: ""
    }; n.oJUIClasses = { sPagePrevEnabled: "fg-button ui-button ui-state-default ui-corner-left", sPagePrevDisabled: "fg-button ui-button ui-state-default ui-corner-left ui-state-disabled",
        sPageNextEnabled: "fg-button ui-button ui-state-default ui-corner-right", sPageNextDisabled: "fg-button ui-button ui-state-default ui-corner-right ui-state-disabled", sPageJUINext: "ui-icon ui-icon-circle-arrow-e", sPageJUIPrev: "ui-icon ui-icon-circle-arrow-w", sPageButton: "fg-button ui-button ui-state-default", sPageButtonActive: "fg-button ui-button ui-state-default ui-state-disabled", sPageButtonStaticDisabled: "fg-button ui-button ui-state-default ui-state-disabled", sPageFirst: "first ui-corner-tl ui-corner-bl",
        sPagePrevious: "previous", sPageNext: "next", sPageLast: "last ui-corner-tr ui-corner-br", sStripOdd: "odd", sStripEven: "even", sRowEmpty: "dataTables_empty", sWrapper: "dataTables_wrapper", sFilter: "dataTables_filter", sInfo: "dataTables_info", sPaging: "dataTables_paginate fg-buttonset ui-buttonset fg-buttonset-multi ui-buttonset-multi paging_", sLength: "dataTables_length", sProcessing: "dataTables_processing", sSortAsc: "ui-state-default", sSortDesc: "ui-state-default", sSortable: "ui-state-default", sSortableAsc: "ui-state-default",
        sSortableDesc: "ui-state-default", sSortableNone: "ui-state-default", sSortColumn: "sorting_", sSortJUIAsc: "css_right ui-icon ui-icon-triangle-1-n", sSortJUIDesc: "css_right ui-icon ui-icon-triangle-1-s", sSortJUI: "css_right ui-icon ui-icon-carat-2-n-s", sSortJUIAscAllowed: "css_right ui-icon ui-icon-carat-1-n", sSortJUIDescAllowed: "css_right ui-icon ui-icon-carat-1-s", sSortJUIWrapper: "DataTables_sort_wrapper", sScrollWrapper: "dataTables_scroll", sScrollHead: "dataTables_scrollHead ui-state-default", sScrollHeadInner: "dataTables_scrollHeadInner",
        sScrollBody: "dataTables_scrollBody", sScrollFoot: "dataTables_scrollFoot ui-state-default", sScrollFootInner: "dataTables_scrollFootInner", sFooterTH: "ui-state-default"
    }; n.oPagination = { two_button: { fnInit: function (g, m, r) {
        var s, w, y; if (g.bJUI) { s = p.createElement("a"); w = p.createElement("a"); y = p.createElement("span"); y.className = g.oClasses.sPageJUINext; w.appendChild(y); y = p.createElement("span"); y.className = g.oClasses.sPageJUIPrev; s.appendChild(y) } else { s = p.createElement("div"); w = p.createElement("div") } s.className =
g.oClasses.sPagePrevDisabled; w.className = g.oClasses.sPageNextDisabled; s.title = g.oLanguage.oPaginate.sPrevious; w.title = g.oLanguage.oPaginate.sNext; m.appendChild(s); m.appendChild(w); j(s).click(function () { g.oApi._fnPageChange(g, "previous") && r(g) }); j(w).click(function () { g.oApi._fnPageChange(g, "next") && r(g) }); j(s).bind("selectstart", function () { return false }); j(w).bind("selectstart", function () { return false }); if (g.sTableId !== "" && typeof g.aanFeatures.p == "undefined") {
            m.setAttribute("id", g.sTableId + "_paginate");
            s.setAttribute("id", g.sTableId + "_previous"); w.setAttribute("id", g.sTableId + "_next")
        } 
    }, fnUpdate: function (g) { if (g.aanFeatures.p) for (var m = g.aanFeatures.p, r = 0, s = m.length; r < s; r++) if (m[r].childNodes.length !== 0) { m[r].childNodes[0].className = g._iDisplayStart === 0 ? g.oClasses.sPagePrevDisabled : g.oClasses.sPagePrevEnabled; m[r].childNodes[1].className = g.fnDisplayEnd() == g.fnRecordsDisplay() ? g.oClasses.sPageNextDisabled : g.oClasses.sPageNextEnabled } } 
    }, iFullNumbersShowPages: 5, full_numbers: { fnInit: function (g, m, r) {
        var s =
p.createElement("span"), w = p.createElement("span"), y = p.createElement("span"), F = p.createElement("span"), x = p.createElement("span"); s.innerHTML = g.oLanguage.oPaginate.sFirst; w.innerHTML = g.oLanguage.oPaginate.sPrevious; F.innerHTML = g.oLanguage.oPaginate.sNext; x.innerHTML = g.oLanguage.oPaginate.sLast; var v = g.oClasses; s.className = v.sPageButton + " " + v.sPageFirst; w.className = v.sPageButton + " " + v.sPagePrevious; F.className = v.sPageButton + " " + v.sPageNext; x.className = v.sPageButton + " " + v.sPageLast; m.appendChild(s); m.appendChild(w);
        m.appendChild(y); m.appendChild(F); m.appendChild(x); j(s).click(function () { g.oApi._fnPageChange(g, "first") && r(g) }); j(w).click(function () { g.oApi._fnPageChange(g, "previous") && r(g) }); j(F).click(function () { g.oApi._fnPageChange(g, "next") && r(g) }); j(x).click(function () { g.oApi._fnPageChange(g, "last") && r(g) }); j("span", m).bind("mousedown", function () { return false }).bind("selectstart", function () { return false }); if (g.sTableId !== "" && typeof g.aanFeatures.p == "undefined") {
            m.setAttribute("id", g.sTableId + "_paginate");
            s.setAttribute("id", g.sTableId + "_first"); w.setAttribute("id", g.sTableId + "_previous"); F.setAttribute("id", g.sTableId + "_next"); x.setAttribute("id", g.sTableId + "_last")
        } 
    }, fnUpdate: function (g, m) {
        if (g.aanFeatures.p) {
            var r = n.oPagination.iFullNumbersShowPages, s = Math.floor(r / 2), w = Math.ceil(g.fnRecordsDisplay() / g._iDisplayLength), y = Math.ceil(g._iDisplayStart / g._iDisplayLength) + 1, F = "", x, v = g.oClasses; if (w < r) { s = 1; x = w } else if (y <= s) { s = 1; x = r } else if (y >= w - s) { s = w - r + 1; x = w } else { s = y - Math.ceil(r / 2) + 1; x = s + r - 1 } for (r = s; r <=
x; r++) F += y != r ? '<span class="' + v.sPageButton + '">' + r + "</span>" : '<span class="' + v.sPageButtonActive + '">' + r + "</span>"; x = g.aanFeatures.p; var z, U = function () { g._iDisplayStart = (this.innerHTML * 1 - 1) * g._iDisplayLength; m(g); return false }, C = function () { return false }; r = 0; for (s = x.length; r < s; r++) if (x[r].childNodes.length !== 0) {
                z = j("span:eq(2)", x[r]); z.html(F); j("span", z).click(U).bind("mousedown", C).bind("selectstart", C); z = x[r].getElementsByTagName("span"); z = [z[0], z[1], z[z.length - 2], z[z.length - 1]]; j(z).removeClass(v.sPageButton +
" " + v.sPageButtonActive + " " + v.sPageButtonStaticDisabled); if (y == 1) { z[0].className += " " + v.sPageButtonStaticDisabled; z[1].className += " " + v.sPageButtonStaticDisabled } else { z[0].className += " " + v.sPageButton; z[1].className += " " + v.sPageButton } if (w === 0 || y == w || g._iDisplayLength == -1) { z[2].className += " " + v.sPageButtonStaticDisabled; z[3].className += " " + v.sPageButtonStaticDisabled } else { z[2].className += " " + v.sPageButton; z[3].className += " " + v.sPageButton } 
            } 
        } 
    } 
    }
    }; n.oSort = { "string-asc": function (g, m) {
        g = g.toLowerCase();
        m = m.toLowerCase(); return g < m ? -1 : g > m ? 1 : 0
    }, "string-desc": function (g, m) { g = g.toLowerCase(); m = m.toLowerCase(); return g < m ? 1 : g > m ? -1 : 0 }, "html-asc": function (g, m) { g = g.replace(/<.*?>/g, "").toLowerCase(); m = m.replace(/<.*?>/g, "").toLowerCase(); return g < m ? -1 : g > m ? 1 : 0 }, "html-desc": function (g, m) { g = g.replace(/<.*?>/g, "").toLowerCase(); m = m.replace(/<.*?>/g, "").toLowerCase(); return g < m ? 1 : g > m ? -1 : 0 }, "date-asc": function (g, m) {
        g = Date.parse(g); m = Date.parse(m); if (isNaN(g) || g === "") g = Date.parse("01/01/1970 00:00:00"); if (isNaN(m) ||
m === "") m = Date.parse("01/01/1970 00:00:00"); return g - m
    }, "date-desc": function (g, m) { g = Date.parse(g); m = Date.parse(m); if (isNaN(g) || g === "") g = Date.parse("01/01/1970 00:00:00"); if (isNaN(m) || m === "") m = Date.parse("01/01/1970 00:00:00"); return m - g }, "numeric-asc": function (g, m) { return (g == "-" || g === "" ? 0 : g * 1) - (m == "-" || m === "" ? 0 : m * 1) }, "numeric-desc": function (g, m) { return (m == "-" || m === "" ? 0 : m * 1) - (g == "-" || g === "" ? 0 : g * 1) } 
    }; n.aTypes = [function (g) {
        if (g.length === 0) return "numeric"; var m, r = false; m = g.charAt(0); if ("0123456789-".indexOf(m) ==
-1) return null; for (var s = 1; s < g.length; s++) { m = g.charAt(s); if ("0123456789.".indexOf(m) == -1) return null; if (m == ".") { if (r) return null; r = true } } return "numeric"
    }, function (g) { var m = Date.parse(g); if (m !== null && !isNaN(m) || g.length === 0) return "date"; return null }, function (g) { if (g.indexOf("<") != -1 && g.indexOf(">") != -1) return "html"; return null } ]; n.fnVersionCheck = function (g) {
        var m = function (x, v) { for (; x.length < v; ) x += "0"; return x }, r = n.sVersion.split("."); g = g.split("."); for (var s = "", w = "", y = 0, F = g.length; y < F; y++) {
            s += m(r[y],
3); w += m(g[y], 3)
        } return parseInt(s, 10) >= parseInt(w, 10)
    }; n._oExternConfig = { iNextUnique: 0 }; j.fn.dataTable = function (g) {
        function m() {
            this.fnRecordsTotal = function () { return this.oFeatures.bServerSide ? parseInt(this._iRecordsTotal, 10) : this.aiDisplayMaster.length }; this.fnRecordsDisplay = function () { return this.oFeatures.bServerSide ? parseInt(this._iRecordsDisplay, 10) : this.aiDisplay.length }; this.fnDisplayEnd = function () {
                return this.oFeatures.bServerSide ? this.oFeatures.bPaginate === false || this._iDisplayLength == -1 ?
this._iDisplayStart + this.aiDisplay.length : Math.min(this._iDisplayStart + this._iDisplayLength, this._iRecordsDisplay) : this._iDisplayEnd
            }; this.sInstance = this.oInstance = null; this.oFeatures = { bPaginate: true, bLengthChange: true, bFilter: true, bSort: true, bInfo: true, bAutoWidth: true, bProcessing: false, bSortClasses: true, bStateSave: false, bServerSide: false }; this.oScroll = { sX: "", sXInner: "", sY: "", bCollapse: false, bInfinite: false, iLoadGap: 100, iBarWidth: 0, bAutoCss: true }; this.aanFeatures = []; this.oLanguage = { sProcessing: "Processing...",
                sLengthMenu: "Show _MENU_ entries", sZeroRecords: "No matching records found", sEmptyTable: "No data available in table", sInfo: "Showing _START_ to _END_ of _TOTAL_ entries", sInfoEmpty: "Showing 0 to 0 of 0 entries", sInfoFiltered: "(filtered from _MAX_ total entries)", sInfoPostFix: "", sSearch: "Search:", sUrl: "", oPaginate: { sFirst: "First", sPrevious: "Previous", sNext: "Next", sLast: "Last" }, fnInfoCallback: null
            }; this.aoData = []; this.aiDisplay = []; this.aiDisplayMaster = []; this.aoColumns = []; this.iNextId = 0; this.asDataSearch =
[]; this.oPreviousSearch = { sSearch: "", bRegex: false, bSmart: true }; this.aoPreSearchCols = []; this.aaSorting = [[0, "asc", 0]]; this.aaSortingFixed = null; this.asStripClasses = []; this.asDestoryStrips = []; this.sDestroyWidth = 0; this.fnFooterCallback = this.fnHeaderCallback = this.fnRowCallback = null; this.aoDrawCallback = []; this.fnInitComplete = null; this.sTableId = ""; this.nTableWrapper = this.nTBody = this.nTFoot = this.nTHead = this.nTable = null; this.bInitialised = false; this.aoOpenRows = []; this.sDom = "lfrtip"; this.sPaginationType = "two_button";
            this.iCookieDuration = 7200; this.sCookiePrefix = "SpryMedia_DataTables_"; this.fnCookieCallback = null; this.aoStateSave = []; this.aoStateLoad = []; this.sAjaxSource = this.oLoadedState = null; this.bAjaxDataGet = true; this.fnServerData = function (a, b, c) { j.ajax({ url: a, data: b, success: c, dataType: "json", cache: false, error: function (d, f) { f == "parsererror" && alert("DataTables warning: JSON data from server could not be parsed. This is caused by a JSON formatting error.") } }) }; this.fnFormatNumber = function (a) {
                if (a < 1E3) return a; else {
                    var b =
a + ""; a = b.split(""); var c = ""; b = b.length; for (var d = 0; d < b; d++) { if (d % 3 === 0 && d !== 0) c = "," + c; c = a[b - d - 1] + c } 
                } return c
            }; this.aLengthMenu = [10, 25, 50, 100]; this.bDrawing = this.iDraw = 0; this.iDrawError = -1; this._iDisplayLength = 10; this._iDisplayStart = 0; this._iDisplayEnd = 10; this._iRecordsDisplay = this._iRecordsTotal = 0; this.bJUI = false; this.oClasses = n.oStdClasses; this.bSorted = this.bFiltered = false; this.oInit = null
        } function r(a) {
            return function () {
                var b = [A(this[n.iApiIndex])].concat(Array.prototype.slice.call(arguments)); return n.oApi[a].apply(this,
b)
            } 
        } function s(a) {
            var b, c; if (a.bInitialised === false) setTimeout(function () { s(a) }, 200); else {
                ra(a); U(a); K(a, true); a.oFeatures.bAutoWidth && $(a); b = 0; for (c = a.aoColumns.length; b < c; b++) if (a.aoColumns[b].sWidth !== null) a.aoColumns[b].nTh.style.width = u(a.aoColumns[b].sWidth); if (a.oFeatures.bSort) O(a); else { a.aiDisplay = a.aiDisplayMaster.slice(); E(a); C(a) } if (a.sAjaxSource !== null && !a.oFeatures.bServerSide) a.fnServerData.call(a.oInstance, a.sAjaxSource, [], function (d) {
                    for (b = 0; b < d.aaData.length; b++) v(a, d.aaData[b]);
                    a.iInitDisplayStart = a._iDisplayStart; if (a.oFeatures.bSort) O(a); else { a.aiDisplay = a.aiDisplayMaster.slice(); E(a); C(a) } K(a, false); w(a, d)
                }); else if (!a.oFeatures.bServerSide) { K(a, false); w(a) } 
            } 
        } function w(a, b) { a._bInitComplete = true; if (typeof a.fnInitComplete == "function") typeof b != "undefined" ? a.fnInitComplete.call(a.oInstance, a, b) : a.fnInitComplete.call(a.oInstance, a) } function y(a, b, c) {
            o(a.oLanguage, b, "sProcessing"); o(a.oLanguage, b, "sLengthMenu"); o(a.oLanguage, b, "sEmptyTable"); o(a.oLanguage, b, "sZeroRecords");
            o(a.oLanguage, b, "sInfo"); o(a.oLanguage, b, "sInfoEmpty"); o(a.oLanguage, b, "sInfoFiltered"); o(a.oLanguage, b, "sInfoPostFix"); o(a.oLanguage, b, "sSearch"); if (typeof b.oPaginate != "undefined") { o(a.oLanguage.oPaginate, b.oPaginate, "sFirst"); o(a.oLanguage.oPaginate, b.oPaginate, "sPrevious"); o(a.oLanguage.oPaginate, b.oPaginate, "sNext"); o(a.oLanguage.oPaginate, b.oPaginate, "sLast") } typeof b.sEmptyTable == "undefined" && typeof b.sZeroRecords != "undefined" && o(a.oLanguage, b, "sZeroRecords", "sEmptyTable"); c && s(a)
        } function F(a,
b) {
            a.aoColumns[a.aoColumns.length++] = { sType: null, _bAutoType: true, bVisible: true, bSearchable: true, bSortable: true, asSorting: ["asc", "desc"], sSortingClass: a.oClasses.sSortable, sSortingClassJUI: a.oClasses.sSortJUI, sTitle: b ? b.innerHTML : "", sName: "", sWidth: null, sWidthOrig: null, sClass: null, fnRender: null, bUseRendered: true, iDataSort: a.aoColumns.length - 1, sSortDataType: "std", nTh: b ? b : p.createElement("th"), nTf: null, anThExtra: [], anTfExtra: [] }; b = a.aoColumns.length - 1; if (typeof a.aoPreSearchCols[b] == "undefined" || a.aoPreSearchCols[b] ===
null) a.aoPreSearchCols[b] = { sSearch: "", bRegex: false, bSmart: true }; else { if (typeof a.aoPreSearchCols[b].bRegex == "undefined") a.aoPreSearchCols[b].bRegex = true; if (typeof a.aoPreSearchCols[b].bSmart == "undefined") a.aoPreSearchCols[b].bSmart = true } x(a, b, null)
        } function x(a, b, c) {
            b = a.aoColumns[b]; if (typeof c != "undefined" && c !== null) {
                if (typeof c.sType != "undefined") { b.sType = c.sType; b._bAutoType = false } o(b, c, "bVisible"); o(b, c, "bSearchable"); o(b, c, "bSortable"); o(b, c, "sTitle"); o(b, c, "sName"); o(b, c, "sWidth"); o(b, c, "sWidth",
"sWidthOrig"); o(b, c, "sClass"); o(b, c, "fnRender"); o(b, c, "bUseRendered"); o(b, c, "iDataSort"); o(b, c, "asSorting"); o(b, c, "sSortDataType")
            } if (!a.oFeatures.bSort) b.bSortable = false; if (!b.bSortable || j.inArray("asc", b.asSorting) == -1 && j.inArray("desc", b.asSorting) == -1) { b.sSortingClass = a.oClasses.sSortableNone; b.sSortingClassJUI = "" } else if (j.inArray("asc", b.asSorting) != -1 && j.inArray("desc", b.asSorting) == -1) { b.sSortingClass = a.oClasses.sSortableAsc; b.sSortingClassJUI = a.oClasses.sSortJUIAscAllowed } else if (j.inArray("asc",
b.asSorting) == -1 && j.inArray("desc", b.asSorting) != -1) { b.sSortingClass = a.oClasses.sSortableDesc; b.sSortingClassJUI = a.oClasses.sSortJUIDescAllowed } 
        } function v(a, b) {
            if (b.length != a.aoColumns.length && a.iDrawError != a.iDraw) { H(a, 0, "Added data (size " + b.length + ") does not match known number of columns (" + a.aoColumns.length + ")"); a.iDrawError = a.iDraw; return -1 } b = b.slice(); var c = a.aoData.length; a.aoData.push({ nTr: p.createElement("tr"), _iId: a.iNextId++, _aData: b, _anHidden: [], _sRowStripe: "" }); for (var d, f, e = 0; e < b.length; e++) {
                d =
p.createElement("td"); if (b[e] === null) b[e] = ""; if (typeof a.aoColumns[e].fnRender == "function") { f = a.aoColumns[e].fnRender({ iDataRow: c, iDataColumn: e, aData: b, oSettings: a }); d.innerHTML = f; if (a.aoColumns[e].bUseRendered) a.aoData[c]._aData[e] = f } else d.innerHTML = b[e]; if (typeof b[e] != "string") b[e] += ""; b[e] = j.trim(b[e]); if (a.aoColumns[e].sClass !== null) d.className = a.aoColumns[e].sClass; if (a.aoColumns[e]._bAutoType && a.aoColumns[e].sType != "string") {
                    f = aa(a.aoData[c]._aData[e]); if (a.aoColumns[e].sType === null) a.aoColumns[e].sType =
f; else if (a.aoColumns[e].sType != f) a.aoColumns[e].sType = "string"
                } if (a.aoColumns[e].bVisible) { a.aoData[c].nTr.appendChild(d); a.aoData[c]._anHidden[e] = null } else a.aoData[c]._anHidden[e] = d
            } a.aiDisplayMaster.push(c); return c
        } function z(a) {
            var b, c, d, f, e, i, h, k; if (a.sAjaxSource === null) {
                h = a.nTBody.childNodes; b = 0; for (c = h.length; b < c; b++) if (h[b].nodeName.toUpperCase() == "TR") {
                    i = a.aoData.length; a.aoData.push({ nTr: h[b], _iId: a.iNextId++, _aData: [], _anHidden: [], _sRowStripe: "" }); a.aiDisplayMaster.push(i); k = a.aoData[i]._aData;
                    i = h[b].childNodes; d = e = 0; for (f = i.length; d < f; d++) if (i[d].nodeName.toUpperCase() == "TD") { k[e] = j.trim(i[d].innerHTML); e++ } 
                } 
            } h = R(a); i = []; b = 0; for (c = h.length; b < c; b++) { d = 0; for (f = h[b].childNodes.length; d < f; d++) { e = h[b].childNodes[d]; e.nodeName.toUpperCase() == "TD" && i.push(e) } } i.length != h.length * a.aoColumns.length && H(a, 1, "Unexpected number of TD elements. Expected " + h.length * a.aoColumns.length + " and got " + i.length + ". DataTables does not support rowspan / colspan in the table body, and there must be one cell for each row/column combination.");
            h = 0; for (d = a.aoColumns.length; h < d; h++) {
                if (a.aoColumns[h].sTitle === null) a.aoColumns[h].sTitle = a.aoColumns[h].nTh.innerHTML; f = a.aoColumns[h]._bAutoType; e = typeof a.aoColumns[h].fnRender == "function"; k = a.aoColumns[h].sClass !== null; var l = a.aoColumns[h].bVisible, q, t; if (f || e || k || !l) {
                    b = 0; for (c = a.aoData.length; b < c; b++) {
                        q = i[b * d + h]; if (f) if (a.aoColumns[h].sType != "string") { t = aa(a.aoData[b]._aData[h]); if (a.aoColumns[h].sType === null) a.aoColumns[h].sType = t; else if (a.aoColumns[h].sType != t) a.aoColumns[h].sType = "string" } if (e) {
                            t =
a.aoColumns[h].fnRender({ iDataRow: b, iDataColumn: h, aData: a.aoData[b]._aData, oSettings: a }); q.innerHTML = t; if (a.aoColumns[h].bUseRendered) a.aoData[b]._aData[h] = t
                        } if (k) q.className += " " + a.aoColumns[h].sClass; if (l) a.aoData[b]._anHidden[h] = null; else { a.aoData[b]._anHidden[h] = q; q.parentNode.removeChild(q) } 
                    } 
                } 
            } 
        } function U(a) {
            var b, c, d, f, e, i = a.nTHead.getElementsByTagName("tr"), h = 0, k; if (a.nTHead.getElementsByTagName("th").length !== 0) {
                b = 0; for (d = a.aoColumns.length; b < d; b++) {
                    c = a.aoColumns[b].nTh; a.aoColumns[b].sClass !==
null && j(c).addClass(a.aoColumns[b].sClass); f = 1; for (e = i.length; f < e; f++) { k = j(i[f]).children(); a.aoColumns[b].anThExtra.push(k[b - h]); a.aoColumns[b].bVisible || i[f].removeChild(k[b - h]) } if (a.aoColumns[b].bVisible) { if (a.aoColumns[b].sTitle != c.innerHTML) c.innerHTML = a.aoColumns[b].sTitle } else { c.parentNode.removeChild(c); h++ } 
                } 
            } else {
                f = p.createElement("tr"); b = 0; for (d = a.aoColumns.length; b < d; b++) {
                    c = a.aoColumns[b].nTh; c.innerHTML = a.aoColumns[b].sTitle; a.aoColumns[b].sClass !== null && j(c).addClass(a.aoColumns[b].sClass);
                    a.aoColumns[b].bVisible && f.appendChild(c)
                } j(a.nTHead).html("")[0].appendChild(f)
            } if (a.bJUI) { b = 0; for (d = a.aoColumns.length; b < d; b++) { c = a.aoColumns[b].nTh; f = p.createElement("div"); f.className = a.oClasses.sSortJUIWrapper; j(c).contents().appendTo(f); f.appendChild(p.createElement("span")); c.appendChild(f) } } d = function () { this.onselectstart = function () { return false }; return false }; if (a.oFeatures.bSort) for (b = 0; b < a.aoColumns.length; b++) if (a.aoColumns[b].bSortable !== false) { ba(a, a.aoColumns[b].nTh, b); j(a.aoColumns[b].nTh).mousedown(d) } else j(a.aoColumns[b].nTh).addClass(a.oClasses.sSortableNone);
            if (a.nTFoot !== null) { h = 0; i = a.nTFoot.getElementsByTagName("tr"); c = i[0].getElementsByTagName("th"); b = 0; for (d = c.length; b < d; b++) if (typeof a.aoColumns[b] != "undefined") { a.aoColumns[b].nTf = c[b - h]; if (a.oClasses.sFooterTH !== "") a.aoColumns[b].nTf.className += " " + a.oClasses.sFooterTH; f = 1; for (e = i.length; f < e; f++) { k = j(i[f]).children(); a.aoColumns[b].anTfExtra.push(k[b - h]); a.aoColumns[b].bVisible || i[f].removeChild(k[b - h]) } if (!a.aoColumns[b].bVisible) { c[b - h].parentNode.removeChild(c[b - h]); h++ } } } 
        } function C(a) {
            var b,
c, d = [], f = 0, e = false; b = a.asStripClasses.length; c = a.aoOpenRows.length; a.bDrawing = true; if (typeof a.iInitDisplayStart != "undefined" && a.iInitDisplayStart != -1) { a._iDisplayStart = a.oFeatures.bServerSide ? a.iInitDisplayStart : a.iInitDisplayStart >= a.fnRecordsDisplay() ? 0 : a.iInitDisplayStart; a.iInitDisplayStart = -1; E(a) } if (!(!a.bDestroying && a.oFeatures.bServerSide && !sa(a))) {
                a.oFeatures.bServerSide || a.iDraw++; if (a.aiDisplay.length !== 0) {
                    var i = a._iDisplayStart, h = a._iDisplayEnd; if (a.oFeatures.bServerSide) { i = 0; h = a.aoData.length } for (i =
i; i < h; i++) { var k = a.aoData[a.aiDisplay[i]], l = k.nTr; if (b !== 0) { var q = a.asStripClasses[f % b]; if (k._sRowStripe != q) { j(l).removeClass(k._sRowStripe).addClass(q); k._sRowStripe = q } } if (typeof a.fnRowCallback == "function") { l = a.fnRowCallback.call(a.oInstance, l, a.aoData[a.aiDisplay[i]]._aData, f, i); if (!l && !e) { H(a, 0, "A node was not returned by fnRowCallback"); e = true } } d.push(l); f++; if (c !== 0) for (k = 0; k < c; k++) l == a.aoOpenRows[k].nParent && d.push(a.aoOpenRows[k].nTr) } 
                } else {
                    d[0] = p.createElement("tr"); if (typeof a.asStripClasses[0] !=
"undefined") d[0].className = a.asStripClasses[0]; e = p.createElement("td"); e.setAttribute("valign", "top"); e.colSpan = S(a); e.className = a.oClasses.sRowEmpty; e.innerHTML = typeof a.oLanguage.sEmptyTable != "undefined" && a.fnRecordsTotal() === 0 ? a.oLanguage.sEmptyTable : a.oLanguage.sZeroRecords.replace("_MAX_", a.fnFormatNumber(a.fnRecordsTotal())); d[f].appendChild(e)
                } typeof a.fnHeaderCallback == "function" && a.fnHeaderCallback.call(a.oInstance, j(">tr", a.nTHead)[0], V(a), a._iDisplayStart, a.fnDisplayEnd(), a.aiDisplay);
                typeof a.fnFooterCallback == "function" && a.fnFooterCallback.call(a.oInstance, j(">tr", a.nTFoot)[0], V(a), a._iDisplayStart, a.fnDisplayEnd(), a.aiDisplay); f = p.createDocumentFragment(); b = p.createDocumentFragment(); if (a.nTBody) { e = a.nTBody.parentNode; b.appendChild(a.nTBody); if (!a.oScroll.bInfinite || !a._bInitComplete || a.bSorted || a.bFiltered) { c = a.nTBody.childNodes; for (b = c.length - 1; b >= 0; b--) c[b].parentNode.removeChild(c[b]) } b = 0; for (c = d.length; b < c; b++) f.appendChild(d[b]); a.nTBody.appendChild(f); e !== null && e.appendChild(a.nTBody) } for (b =
a.aoDrawCallback.length - 1; b >= 0; b--) a.aoDrawCallback[b].fn.call(a.oInstance, a); a.bSorted = false; a.bFiltered = false; a.bDrawing = false; if (a.oFeatures.bServerSide) { K(a, false); typeof a._bInitComplete == "undefined" && w(a) } 
            } 
        } function W(a) { if (a.oFeatures.bSort) O(a, a.oPreviousSearch); else if (a.oFeatures.bFilter) P(a, a.oPreviousSearch); else { E(a); C(a) } } function sa(a) {
            if (a.bAjaxDataGet) {
                K(a, true); var b = a.aoColumns.length, c = [], d; a.iDraw++;
                c.push({ name: "sEcho", value: a.iDraw });
                c.push({ name: "iColumns", value: b });
                c.push({ name: "sColumns", value: ca(a) });
                
                c.push({ name: "iDisplayStart", value: a._iDisplayStart }); c.push({ name: "iDisplayLength", value: a.oFeatures.bPaginate !== false ? a._iDisplayLength : -1 }); if (a.oFeatures.bFilter !== false) { c.push({ name: "sSearch", value: a.oPreviousSearch.sSearch }); c.push({ name: "bRegex", value: a.oPreviousSearch.bRegex }); for (d = 0; d < b; d++) { c.push({ name: "sSearch_" + d, value: a.aoPreSearchCols[d].sSearch }); c.push({ name: "bRegex_" + d, value: a.aoPreSearchCols[d].bRegex }); c.push({ name: "bSearchable_" + d, value: a.aoColumns[d].bSearchable }) } } if (a.oFeatures.bSort !==
false) { var f = a.aaSortingFixed !== null ? a.aaSortingFixed.length : 0, e = a.aaSorting.length; c.push({ name: "iSortingCols", value: f + e }); for (d = 0; d < f; d++) { c.push({ name: "iSortCol_" + d, value: a.aaSortingFixed[d][0] }); c.push({ name: "sSortDir_" + d, value: a.aaSortingFixed[d][1] }) } for (d = 0; d < e; d++) { c.push({ name: "iSortCol_" + (d + f), value: a.aaSorting[d][0] }); c.push({ name: "sSortDir_" + (d + f), value: a.aaSorting[d][1] }) } for (d = 0; d < b; d++) c.push({ name: "bSortable_" + d, value: a.aoColumns[d].bSortable }) } a.fnServerData.call(a.oInstance, a.sAjaxSource,
c, function (i) { ta(a, i) }); return false
            } else return true
        } function ta(a, b) {
            if (typeof b.sEcho != "undefined") if (b.sEcho * 1 < a.iDraw) return; else a.iDraw = b.sEcho * 1;
            if (!a.oScroll.bInfinite || a.oScroll.bInfinite && (a.bSorted || a.bFiltered)) da(a);
            a._iRecordsTotal = b.iTotalRecords; a._iRecordsDisplay = b.iTotalDisplayRecords; var c = ca(a);
            if (c = typeof b.sColumns != "undefined" && c !== "" && b.sColumns != c) var d = ua(a, b.sColumns);
            for (var f = 0, e = b.aaData.length; f < e; f++) if (c) {

                for (var i = [], h = 0, k = a.aoColumns.length; h < k; h++) i.push(b.aaData[f][d[h]]);
                v(a, i)
            } else v(a, b.aaData[f]); a.aiDisplay = a.aiDisplayMaster.slice(); a.bAjaxDataGet = false; C(a); a.bAjaxDataGet = true; K(a, false)
        } function ra(a) {
            var b = p.createElement("div"); a.nTable.parentNode.insertBefore(b, a.nTable); a.nTableWrapper = p.createElement("div"); a.nTableWrapper.className = a.oClasses.sWrapper; a.sTableId !== "" && a.nTableWrapper.setAttribute("id", a.sTableId + "_wrapper"); for (var c = a.nTableWrapper, d = a.sDom.split(""), f, e, i, h, k, l, q, t = 0; t < d.length; t++) {
                e = 0; i = d[t]; if (i == "<") {
                    h = p.createElement("div"); k = d[t +
1]; if (k == "'" || k == '"') { l = ""; for (q = 2; d[t + q] != k; ) { l += d[t + q]; q++ } if (l == "H") l = "fg-toolbar ui-toolbar ui-widget-header ui-corner-tl ui-corner-tr ui-helper-clearfix"; else if (l == "F") l = "fg-toolbar ui-toolbar ui-widget-header ui-corner-bl ui-corner-br ui-helper-clearfix"; if (l.indexOf(".") != -1) { k = l.split("."); h.setAttribute("id", k[0].substr(1, k[0].length - 1)); h.className = k[1] } else if (l.charAt(0) == "#") h.setAttribute("id", l.substr(1, l.length - 1)); else h.className = l; t += q } c.appendChild(h); c = h
                } else if (i == ">") c = c.parentNode;
                else if (i == "l" && a.oFeatures.bPaginate && a.oFeatures.bLengthChange) { f = va(a); e = 1 } else if (i == "f" && a.oFeatures.bFilter) { f = wa(a); e = 1 } else if (i == "r" && a.oFeatures.bProcessing) { f = xa(a); e = 1 } else if (i == "t") { f = ya(a); e = 1 } else if (i == "i" && a.oFeatures.bInfo) { f = za(a); e = 1 } else if (i == "p" && a.oFeatures.bPaginate) { f = Aa(a); e = 1 } else if (n.aoFeatures.length !== 0) { h = n.aoFeatures; q = 0; for (k = h.length; q < k; q++) if (i == h[q].cFeature) { if (f = h[q].fnInit(a)) e = 1; break } } if (e == 1 && f !== null) {
                    if (typeof a.aanFeatures[i] != "object") a.aanFeatures[i] =
[]; a.aanFeatures[i].push(f); c.appendChild(f)
                } 
            } b.parentNode.replaceChild(a.nTableWrapper, b)
        } function ya(a) {
            if (a.oScroll.sX === "" && a.oScroll.sY === "") return a.nTable; var b = p.createElement("div"), c = p.createElement("div"), d = p.createElement("div"), f = p.createElement("div"), e = p.createElement("div"), i = p.createElement("div"), h = a.nTable.cloneNode(false), k = a.nTable.cloneNode(false), l = a.nTable.getElementsByTagName("thead")[0], q = a.nTable.getElementsByTagName("tfoot").length === 0 ? null : a.nTable.getElementsByTagName("tfoot")[0],
t = typeof g.bJQueryUI != "undefined" && g.bJQueryUI ? n.oJUIClasses : n.oStdClasses; c.appendChild(d); e.appendChild(i); f.appendChild(a.nTable); b.appendChild(c); b.appendChild(f); d.appendChild(h); h.appendChild(l); if (q !== null) { b.appendChild(e); i.appendChild(k); k.appendChild(q) } b.className = t.sScrollWrapper; c.className = t.sScrollHead; d.className = t.sScrollHeadInner; f.className = t.sScrollBody; e.className = t.sScrollFoot; i.className = t.sScrollFootInner; if (a.oScroll.bAutoCss) {
                c.style.overflow = "hidden"; c.style.position = "relative";
                e.style.overflow = "hidden"; f.style.overflow = "auto"
            } c.style.border = "0"; e.style.border = "0"; d.style.width = "150%"; h.removeAttribute("id"); h.style.marginLeft = "0"; a.nTable.style.marginLeft = "0"; if (q !== null) { k.removeAttribute("id"); k.style.marginLeft = "0" } d = j(">caption", a.nTable); i = 0; for (k = d.length; i < k; i++) h.appendChild(d[i]); if (a.oScroll.sX !== "") {
                c.style.width = u(a.oScroll.sX); f.style.width = u(a.oScroll.sX); if (q !== null) e.style.width = u(a.oScroll.sX); j(f).scroll(function () {
                    c.scrollLeft = this.scrollLeft; if (q !==
null) e.scrollLeft = this.scrollLeft
                })
            } if (a.oScroll.sY !== "") f.style.height = u(a.oScroll.sY); a.aoDrawCallback.push({ fn: Ba, sName: "scrolling" }); a.oScroll.bInfinite && j(f).scroll(function () { if (!a.bDrawing) if (j(this).scrollTop() + j(this).height() > j(a.nTable).height() - a.oScroll.iLoadGap) if (a.fnDisplayEnd() < a.fnRecordsDisplay()) { ea(a, "next"); E(a); C(a) } }); a.nScrollHead = c; a.nScrollFoot = e; return b
        } function Ba(a) {
            var b = a.nScrollHead.getElementsByTagName("div")[0], c = b.getElementsByTagName("table")[0], d = a.nTable.parentNode,
f, e, i, h, k, l, q, t, G = []; i = a.nTable.getElementsByTagName("thead"); i.length > 0 && a.nTable.removeChild(i[0]); if (a.nTFoot !== null) { k = a.nTable.getElementsByTagName("tfoot"); k.length > 0 && a.nTable.removeChild(k[0]) } i = a.nTHead.cloneNode(true); a.nTable.insertBefore(i, a.nTable.childNodes[0]); if (a.nTFoot !== null) { k = a.nTFoot.cloneNode(true); a.nTable.insertBefore(k, a.nTable.childNodes[1]) } var J = fa(i); f = 0; for (e = J.length; f < e; f++) { q = ga(a, f); J[f].style.width = a.aoColumns[q].sWidth } a.nTFoot !== null && L(function (B) {
    B.style.width =
""
}, k.getElementsByTagName("tr")); f = j(a.nTable).outerWidth(); if (a.oScroll.sX === "") { a.nTable.style.width = "100%"; if (j.browser.msie && j.browser.version <= 7) a.nTable.style.width = u(j(a.nTable).outerWidth() - a.oScroll.iBarWidth) } else if (a.oScroll.sXInner !== "") a.nTable.style.width = u(a.oScroll.sXInner); else if (f == j(d).width() && j(d).height() < j(a.nTable).height()) { a.nTable.style.width = u(f - a.oScroll.iBarWidth); if (j(a.nTable).outerWidth() > f - a.oScroll.iBarWidth) a.nTable.style.width = u(f) } else a.nTable.style.width =
u(f); f = j(a.nTable).outerWidth(); e = a.nTHead.getElementsByTagName("tr"); i = i.getElementsByTagName("tr"); L(function (B, I) { l = B.style; l.paddingTop = "0"; l.paddingBottom = "0"; l.borderTopWidth = "0"; l.borderBottomWidth = "0"; l.height = 0; t = j(B).width(); I.style.width = u(t); G.push(t) }, i, e); j(i).height(0); if (a.nTFoot !== null) {
                h = k.getElementsByTagName("tr"); k = a.nTFoot.getElementsByTagName("tr"); L(function (B, I) {
                    l = B.style; l.paddingTop = "0"; l.paddingBottom = "0"; l.borderTopWidth = "0"; l.borderBottomWidth = "0"; t = j(B).width(); I.style.width =
u(t); G.push(t)
                }, h, k); j(h).height(0)
            } L(function (B) { B.innerHTML = ""; B.style.width = u(G.shift()) }, i); a.nTFoot !== null && L(function (B) { B.innerHTML = ""; B.style.width = u(G.shift()) }, h); if (j(a.nTable).outerWidth() < f) if (a.oScroll.sX === "") H(a, 1, "The table cannot fit into the current element which will cause column misalignment. It is suggested that you enable x-scrolling or increase the width the table has in which to be drawn"); else a.oScroll.sXInner !== "" && H(a, 1, "The table cannot fit into the current element which will cause column misalignment. It is suggested that you increase the sScrollXInner property to allow it to draw in a larger area, or simply remove that parameter to allow automatic calculation");
            if (a.oScroll.sY === "") if (j.browser.msie && j.browser.version <= 7) d.style.height = u(a.nTable.offsetHeight + a.oScroll.iBarWidth); if (a.oScroll.sY !== "" && a.oScroll.bCollapse) { d.style.height = u(a.oScroll.sY); h = a.oScroll.sX !== "" && a.nTable.offsetWidth > d.offsetWidth ? a.oScroll.iBarWidth : 0; if (a.nTable.offsetHeight < d.offsetHeight) d.style.height = u(j(a.nTable).height() + h) } h = j(a.nTable).outerWidth(); c.style.width = u(h); b.style.width = u(h + a.oScroll.iBarWidth); b.parentNode.style.width = u(j(d).width()); if (a.nTFoot !== null) {
                b =
a.nScrollFoot.getElementsByTagName("div")[0]; c = b.getElementsByTagName("table")[0]; b.style.width = u(a.nTable.offsetWidth + a.oScroll.iBarWidth); c.style.width = u(a.nTable.offsetWidth)
            } if (a.bSorted || a.bFiltered) d.scrollTop = 0
        } function X(a) { if (a.oFeatures.bAutoWidth === false) return false; $(a); for (var b = 0, c = a.aoColumns.length; b < c; b++) a.aoColumns[b].nTh.style.width = a.aoColumns[b].sWidth } function wa(a) {
            var b = p.createElement("div"); a.sTableId !== "" && typeof a.aanFeatures.f == "undefined" && b.setAttribute("id", a.sTableId +
"_filter"); b.className = a.oClasses.sFilter; b.innerHTML = a.oLanguage.sSearch + (a.oLanguage.sSearch === "" ? "" : " ") + '<input type="text" />'; var c = j("input", b); c.val(a.oPreviousSearch.sSearch.replace('"', "&quot;")); c.keyup(function () { for (var d = a.aanFeatures.f, f = 0, e = d.length; f < e; f++) d[f] != this.parentNode && j("input", d[f]).val(this.value); this.value != a.oPreviousSearch.sSearch && P(a, { sSearch: this.value, bRegex: a.oPreviousSearch.bRegex, bSmart: a.oPreviousSearch.bSmart }) }); c.keypress(function (d) { if (d.keyCode == 13) return false });
            return b
        } function P(a, b, c) { Ca(a, b.sSearch, c, b.bRegex, b.bSmart); for (b = 0; b < a.aoPreSearchCols.length; b++) Da(a, a.aoPreSearchCols[b].sSearch, b, a.aoPreSearchCols[b].bRegex, a.aoPreSearchCols[b].bSmart); n.afnFiltering.length !== 0 && Ea(a); a.bFiltered = true; a._iDisplayStart = 0; E(a); C(a); ha(a, 0) } function Ea(a) { for (var b = n.afnFiltering, c = 0, d = b.length; c < d; c++) for (var f = 0, e = 0, i = a.aiDisplay.length; e < i; e++) { var h = a.aiDisplay[e - f]; if (!b[c](a, a.aoData[h]._aData, h)) { a.aiDisplay.splice(e - f, 1); f++ } } } function Da(a, b, c, d, f) {
            if (b !==
"") { var e = 0; b = ia(b, d, f); for (d = a.aiDisplay.length - 1; d >= 0; d--) { f = ja(a.aoData[a.aiDisplay[d]]._aData[c], a.aoColumns[c].sType); if (!b.test(f)) { a.aiDisplay.splice(d, 1); e++ } } } 
        } function Ca(a, b, c, d, f) {
            var e = ia(b, d, f); if (typeof c == "undefined" || c === null) c = 0; if (n.afnFiltering.length !== 0) c = 1; if (b.length <= 0) { a.aiDisplay.splice(0, a.aiDisplay.length); a.aiDisplay = a.aiDisplayMaster.slice() } else if (a.aiDisplay.length == a.aiDisplayMaster.length || a.oPreviousSearch.sSearch.length > b.length || c == 1 || b.indexOf(a.oPreviousSearch.sSearch) !==
0) { a.aiDisplay.splice(0, a.aiDisplay.length); ha(a, 1); for (c = 0; c < a.aiDisplayMaster.length; c++) e.test(a.asDataSearch[c]) && a.aiDisplay.push(a.aiDisplayMaster[c]) } else { var i = 0; for (c = 0; c < a.asDataSearch.length; c++) if (!e.test(a.asDataSearch[c])) { a.aiDisplay.splice(c - i, 1); i++ } } a.oPreviousSearch.sSearch = b; a.oPreviousSearch.bRegex = d; a.oPreviousSearch.bSmart = f
        } function ha(a, b) {
            a.asDataSearch.splice(0, a.asDataSearch.length); b = typeof b != "undefined" && b == 1 ? a.aiDisplayMaster : a.aiDisplay; for (var c = 0, d = b.length; c < d; c++) a.asDataSearch[c] =
ka(a, a.aoData[b[c]]._aData)
        } function ka(a, b) { for (var c = "", d = p.createElement("div"), f = 0, e = a.aoColumns.length; f < e; f++) if (a.aoColumns[f].bSearchable) c += ja(b[f], a.aoColumns[f].sType) + "  "; if (c.indexOf("&") !== -1) { d.innerHTML = c; c = d.textContent ? d.textContent : d.innerText; c = c.replace(/\n/g, " ").replace(/\r/g, "") } return c } function ia(a, b, c) { if (c) { a = b ? a.split(" ") : la(a).split(" "); a = "^(?=.*?" + a.join(")(?=.*?") + ").*$"; return new RegExp(a, "i") } else { a = b ? a : la(a); return new RegExp(a, "i") } } function ja(a, b) {
            if (typeof n.ofnSearch[b] ==
"function") return n.ofnSearch[b](a); else if (b == "html") return a.replace(/\n/g, " ").replace(/<.*?>/g, ""); else if (typeof a == "string") return a.replace(/\n/g, " "); return a
        } function O(a, b) {
            var c, d, f, e, i, h, k = [], l = [], q = n.oSort, t = a.aoData, G = a.aoColumns; if (!a.oFeatures.bServerSide && (a.aaSorting.length !== 0 || a.aaSortingFixed !== null)) {
                k = a.aaSortingFixed !== null ? a.aaSortingFixed.concat(a.aaSorting) : a.aaSorting.slice(); for (f = 0; f < k.length; f++) {
                    e = k[f][0]; i = M(a, e); h = a.aoColumns[e].sSortDataType; if (typeof n.afnSortData[h] !=
"undefined") { var J = n.afnSortData[h](a, e, i); i = 0; for (h = t.length; i < h; i++) t[i]._aData[e] = J[i] } 
                } f = 0; for (e = a.aiDisplayMaster.length; f < e; f++) l[a.aiDisplayMaster[f]] = f; var B = k.length; a.aiDisplayMaster.sort(function (I, Y) { var N; for (f = 0; f < B; f++) { c = G[k[f][0]].iDataSort; d = G[c].sType; N = q[d + "-" + k[f][1]](t[I]._aData[c], t[Y]._aData[c]); if (N !== 0) return N } return q["numeric-asc"](l[I], l[Y]) })
            } if (typeof b == "undefined" || b) T(a); a.bSorted = true; if (a.oFeatures.bFilter) P(a, a.oPreviousSearch, 1); else {
                a.aiDisplay = a.aiDisplayMaster.slice();
                a._iDisplayStart = 0; E(a); C(a)
            } 
        } function ba(a, b, c, d) {
            j(b).click(function (f) {
                if (a.aoColumns[c].bSortable !== false) {
                    var e = function () {
                        var i, h; if (f.shiftKey) { for (var k = false, l = 0; l < a.aaSorting.length; l++) if (a.aaSorting[l][0] == c) { k = true; i = a.aaSorting[l][0]; h = a.aaSorting[l][2] + 1; if (typeof a.aoColumns[i].asSorting[h] == "undefined") a.aaSorting.splice(l, 1); else { a.aaSorting[l][1] = a.aoColumns[i].asSorting[h]; a.aaSorting[l][2] = h } break } k === false && a.aaSorting.push([c, a.aoColumns[c].asSorting[0], 0]) } else if (a.aaSorting.length ==
1 && a.aaSorting[0][0] == c) { i = a.aaSorting[0][0]; h = a.aaSorting[0][2] + 1; if (typeof a.aoColumns[i].asSorting[h] == "undefined") h = 0; a.aaSorting[0][1] = a.aoColumns[i].asSorting[h]; a.aaSorting[0][2] = h } else { a.aaSorting.splice(0, a.aaSorting.length); a.aaSorting.push([c, a.aoColumns[c].asSorting[0], 0]) } O(a)
                    }; if (a.oFeatures.bProcessing) { K(a, true); setTimeout(function () { e(); a.oFeatures.bServerSide || K(a, false) }, 0) } else e(); typeof d == "function" && d(a)
                } 
            })
        } function T(a) {
            var b, c, d, f, e, i = a.aoColumns.length, h = a.oClasses; for (b =
0; b < i; b++) a.aoColumns[b].bSortable && j(a.aoColumns[b].nTh).removeClass(h.sSortAsc + " " + h.sSortDesc + " " + a.aoColumns[b].sSortingClass); f = a.aaSortingFixed !== null ? a.aaSortingFixed.concat(a.aaSorting) : a.aaSorting.slice(); for (b = 0; b < a.aoColumns.length; b++) if (a.aoColumns[b].bSortable) {
                e = a.aoColumns[b].sSortingClass; d = -1; for (c = 0; c < f.length; c++) if (f[c][0] == b) { e = f[c][1] == "asc" ? h.sSortAsc : h.sSortDesc; d = c; break } j(a.aoColumns[b].nTh).addClass(e); if (a.bJUI) {
                    c = j("span", a.aoColumns[b].nTh); c.removeClass(h.sSortJUIAsc +
" " + h.sSortJUIDesc + " " + h.sSortJUI + " " + h.sSortJUIAscAllowed + " " + h.sSortJUIDescAllowed); c.addClass(d == -1 ? a.aoColumns[b].sSortingClassJUI : f[d][1] == "asc" ? h.sSortJUIAsc : h.sSortJUIDesc)
                } 
            } else j(a.aoColumns[b].nTh).addClass(a.aoColumns[b].sSortingClass); e = h.sSortColumn; if (a.oFeatures.bSort && a.oFeatures.bSortClasses) {
                d = Z(a); if (d.length >= i) for (b = 0; b < i; b++) if (d[b].className.indexOf(e + "1") != -1) { c = 0; for (a = d.length / i; c < a; c++) d[i * c + b].className = j.trim(d[i * c + b].className.replace(e + "1", "")) } else if (d[b].className.indexOf(e +
"2") != -1) { c = 0; for (a = d.length / i; c < a; c++) d[i * c + b].className = j.trim(d[i * c + b].className.replace(e + "2", "")) } else if (d[b].className.indexOf(e + "3") != -1) { c = 0; for (a = d.length / i; c < a; c++) d[i * c + b].className = j.trim(d[i * c + b].className.replace(" " + e + "3", "")) } h = 1; var k; for (b = 0; b < f.length; b++) { k = parseInt(f[b][0], 10); c = 0; for (a = d.length / i; c < a; c++) d[i * c + k].className += " " + e + h; h < 3 && h++ } 
            } 
        } function Aa(a) {
            if (a.oScroll.bInfinite) return null; var b = p.createElement("div"); b.className = a.oClasses.sPaging + a.sPaginationType; n.oPagination[a.sPaginationType].fnInit(a,
b, function (c) { E(c); C(c) }); typeof a.aanFeatures.p == "undefined" && a.aoDrawCallback.push({ fn: function (c) { n.oPagination[c.sPaginationType].fnUpdate(c, function (d) { E(d); C(d) }) }, sName: "pagination" }); return b
        } function ea(a, b) {
            var c = a._iDisplayStart; if (b == "first") a._iDisplayStart = 0; else if (b == "previous") { a._iDisplayStart = a._iDisplayLength >= 0 ? a._iDisplayStart - a._iDisplayLength : 0; if (a._iDisplayStart < 0) a._iDisplayStart = 0 } else if (b == "next") if (a._iDisplayLength >= 0) {
                if (a._iDisplayStart + a._iDisplayLength < a.fnRecordsDisplay()) a._iDisplayStart +=
a._iDisplayLength
            } else a._iDisplayStart = 0; else if (b == "last") if (a._iDisplayLength >= 0) { b = parseInt((a.fnRecordsDisplay() - 1) / a._iDisplayLength, 10) + 1; a._iDisplayStart = (b - 1) * a._iDisplayLength } else a._iDisplayStart = 0; else H(a, 0, "Unknown paging action: " + b); return c != a._iDisplayStart
        } function za(a) { var b = p.createElement("div"); b.className = a.oClasses.sInfo; if (typeof a.aanFeatures.i == "undefined") { a.aoDrawCallback.push({ fn: Fa, sName: "information" }); a.sTableId !== "" && b.setAttribute("id", a.sTableId + "_info") } return b }
        function Fa(a) {
            if (!(!a.oFeatures.bInfo || a.aanFeatures.i.length === 0)) {
                var b = a._iDisplayStart + 1, c = a.fnDisplayEnd(), d = a.fnRecordsTotal(), f = a.fnRecordsDisplay(), e = a.fnFormatNumber(b), i = a.fnFormatNumber(c), h = a.fnFormatNumber(d), k = a.fnFormatNumber(f); if (a.oScroll.bInfinite) e = a.fnFormatNumber(1); e = a.fnRecordsDisplay() === 0 && a.fnRecordsDisplay() == a.fnRecordsTotal() ? a.oLanguage.sInfoEmpty + a.oLanguage.sInfoPostFix : a.fnRecordsDisplay() === 0 ? a.oLanguage.sInfoEmpty + " " + a.oLanguage.sInfoFiltered.replace("_MAX_",
h) + a.oLanguage.sInfoPostFix : a.fnRecordsDisplay() == a.fnRecordsTotal() ? a.oLanguage.sInfo.replace("_START_", e).replace("_END_", i).replace("_TOTAL_", k) + a.oLanguage.sInfoPostFix : a.oLanguage.sInfo.replace("_START_", e).replace("_END_", i).replace("_TOTAL_", k) + " " + a.oLanguage.sInfoFiltered.replace("_MAX_", a.fnFormatNumber(a.fnRecordsTotal())) + a.oLanguage.sInfoPostFix; if (a.oLanguage.fnInfoCallback !== null) e = a.oLanguage.fnInfoCallback(a, b, c, d, f, e); a = a.aanFeatures.i; b = 0; for (c = a.length; b < c; b++) j(a[b]).html(e)
            } 
        }
        function va(a) {
            if (a.oScroll.bInfinite) return null; var b = '<select size="1" ' + (a.sTableId === "" ? "" : 'name="' + a.sTableId + '_length"') + ">", c, d; if (a.aLengthMenu.length == 2 && typeof a.aLengthMenu[0] == "object" && typeof a.aLengthMenu[1] == "object") { c = 0; for (d = a.aLengthMenu[0].length; c < d; c++) b += '<option value="' + a.aLengthMenu[0][c] + '">' + a.aLengthMenu[1][c] + "</option>" } else { c = 0; for (d = a.aLengthMenu.length; c < d; c++) b += '<option value="' + a.aLengthMenu[c] + '">' + a.aLengthMenu[c] + "</option>" } b += "</select>"; var f = p.createElement("div");
            a.sTableId !== "" && typeof a.aanFeatures.l == "undefined" && f.setAttribute("id", a.sTableId + "_length"); f.className = a.oClasses.sLength; f.innerHTML = a.oLanguage.sLengthMenu.replace("_MENU_", b); j('select option[value="' + a._iDisplayLength + '"]', f).attr("selected", true); j("select", f).change(function () {
                var e = j(this).val(), i = a.aanFeatures.l; c = 0; for (d = i.length; c < d; c++) i[c] != this.parentNode && j("select", i[c]).val(e); a._iDisplayLength = parseInt(e, 10); E(a); if (a.fnDisplayEnd() == a.fnRecordsDisplay()) {
                    a._iDisplayStart = a.fnDisplayEnd() -
a._iDisplayLength; if (a._iDisplayStart < 0) a._iDisplayStart = 0
                } if (a._iDisplayLength == -1) a._iDisplayStart = 0; C(a)
            }); return f
        } function xa(a) { var b = p.createElement("div"); a.sTableId !== "" && typeof a.aanFeatures.r == "undefined" && b.setAttribute("id", a.sTableId + "_processing"); b.innerHTML = a.oLanguage.sProcessing; b.className = a.oClasses.sProcessing; a.nTable.parentNode.insertBefore(b, a.nTable); return b } function K(a, b) {
            if (a.oFeatures.bProcessing) {
                a = a.aanFeatures.r; for (var c = 0, d = a.length; c < d; c++) a[c].style.visibility =
b ? "visible" : "hidden"
            } 
        } function ga(a, b) { for (var c = -1, d = 0; d < a.aoColumns.length; d++) { a.aoColumns[d].bVisible === true && c++; if (c == b) return d } return null } function M(a, b) { for (var c = -1, d = 0; d < a.aoColumns.length; d++) { a.aoColumns[d].bVisible === true && c++; if (d == b) return a.aoColumns[d].bVisible === true ? c : null } return null } function Q(a, b) {
            var c, d; c = a._iDisplayStart; for (d = a._iDisplayEnd; c < d; c++) if (a.aoData[a.aiDisplay[c]].nTr == b) return a.aiDisplay[c]; c = 0; for (d = a.aoData.length; c < d; c++) if (a.aoData[c].nTr == b) return c;
            return null
        } function S(a) { for (var b = 0, c = 0; c < a.aoColumns.length; c++) a.aoColumns[c].bVisible === true && b++; return b } function E(a) { a._iDisplayEnd = a.oFeatures.bPaginate === false ? a.aiDisplay.length : a._iDisplayStart + a._iDisplayLength > a.aiDisplay.length || a._iDisplayLength == -1 ? a.aiDisplay.length : a._iDisplayStart + a._iDisplayLength } function Ga(a, b) {
            if (!a || a === null || a === "") return 0; if (typeof b == "undefined") b = p.getElementsByTagName("body")[0]; var c = p.createElement("div"); c.style.width = a; b.appendChild(c); a = c.offsetWidth;
            b.removeChild(c); return a
        } function $(a) {
            var b = 0, c, d = 0, f = a.aoColumns.length, e, i = j("th", a.nTHead); for (e = 0; e < f; e++) if (a.aoColumns[e].bVisible) { d++; if (a.aoColumns[e].sWidth !== null) { c = Ga(a.aoColumns[e].sWidthOrig, a.nTable.parentNode); if (c !== null) a.aoColumns[e].sWidth = u(c); b++ } } if (f == i.length && b === 0 && d == f && a.oScroll.sX === "" && a.oScroll.sY === "") for (e = 0; e < a.aoColumns.length; e++) { c = j(i[e]).width(); if (c !== null) a.aoColumns[e].sWidth = u(c) } else {
                b = a.nTable.cloneNode(false); e = p.createElement("tbody"); c = p.createElement("tr");
                b.removeAttribute("id"); b.appendChild(a.nTHead.cloneNode(true)); if (a.nTFoot !== null) { b.appendChild(a.nTFoot.cloneNode(true)); L(function (h) { h.style.width = "" }, b.getElementsByTagName("tr")) } b.appendChild(e); e.appendChild(c); e = j("thead th", b); if (e.length === 0) e = j("tbody tr:eq(0)>td", b); e.each(function (h) { this.style.width = ""; h = ga(a, h); if (h !== null && a.aoColumns[h].sWidthOrig !== "") this.style.width = a.aoColumns[h].sWidthOrig }); for (e = 0; e < f; e++) if (a.aoColumns[e].bVisible) {
                    d = Ha(a, e); if (d !== null) {
                        d = d.cloneNode(true);
                        c.appendChild(d)
                    } 
                } e = a.nTable.parentNode; e.appendChild(b); if (a.oScroll.sX !== "" && a.oScroll.sXInner !== "") b.style.width = u(a.oScroll.sXInner); else if (a.oScroll.sX !== "") { b.style.width = ""; if (j(b).width() < e.offsetWidth) b.style.width = u(e.offsetWidth) } else if (a.oScroll.sY !== "") b.style.width = u(e.offsetWidth); b.style.visibility = "hidden"; Ia(a, b); f = j("tbody tr:eq(0)>td", b); if (f.length === 0) f = j("thead tr:eq(0)>th", b); for (e = c = 0; e < a.aoColumns.length; e++) if (a.aoColumns[e].bVisible) {
                    d = j(f[c]).width(); if (d !== null && d >
0) a.aoColumns[e].sWidth = u(d); c++
                } a.nTable.style.width = u(j(b).outerWidth()); b.parentNode.removeChild(b)
            } 
        } function Ia(a, b) { if (a.oScroll.sX === "" && a.oScroll.sY !== "") { j(b).width(); b.style.width = u(j(b).outerWidth() - a.oScroll.iBarWidth) } else if (a.oScroll.sX !== "") b.style.width = u(j(b).outerWidth()) } function Ha(a, b, c) {
            if (typeof c == "undefined" || c) { c = Ja(a, b); b = M(a, b); if (c < 0) return null; return a.aoData[c].nTr.getElementsByTagName("td")[b] } var d = -1, f, e; c = -1; var i = p.createElement("div"); i.style.visibility = "hidden";
            i.style.position = "absolute"; p.body.appendChild(i); f = 0; for (e = a.aoData.length; f < e; f++) { i.innerHTML = a.aoData[f]._aData[b]; if (i.offsetWidth > d) { d = i.offsetWidth; c = f } } p.body.removeChild(i); if (c >= 0) { b = M(a, b); if (a = a.aoData[c].nTr.getElementsByTagName("td")[b]) return a } return null
        } function Ja(a, b) { for (var c = -1, d = -1, f = 0; f < a.aoData.length; f++) { var e = a.aoData[f]._aData[b]; if (e.length > c) { c = e.length; d = f } } return d } function u(a) {
            if (a === null) return "0px"; if (typeof a == "number") { if (a < 0) return "0px"; return a + "px" } var b =
a.charCodeAt(a.length - 1); if (b < 48 || b > 57) return a; return a + "px"
        } function Oa(a, b) { if (a.length != b.length) return 1; for (var c = 0; c < a.length; c++) if (a[c] != b[c]) return 2; return 0 } function aa(a) { for (var b = n.aTypes, c = b.length, d = 0; d < c; d++) { var f = b[d](a); if (f !== null) return f } return "string" } function A(a) { for (var b = 0; b < D.length; b++) if (D[b].nTable == a) return D[b]; return null } function V(a) { for (var b = [], c = a.aoData.length, d = 0; d < c; d++) b.push(a.aoData[d]._aData); return b } function R(a) {
            for (var b = [], c = a.aoData.length, d = 0; d <
c; d++) b.push(a.aoData[d].nTr); return b
        } function Z(a) { var b = R(a), c = [], d, f = [], e, i, h, k; e = 0; for (i = b.length; e < i; e++) { c = []; h = 0; for (k = b[e].childNodes.length; h < k; h++) { d = b[e].childNodes[h]; d.nodeName.toUpperCase() == "TD" && c.push(d) } h = d = 0; for (k = a.aoColumns.length; h < k; h++) if (a.aoColumns[h].bVisible) f.push(c[h - d]); else { f.push(a.aoData[e]._anHidden[h]); d++ } } return f } function la(a) { return a.replace(new RegExp("(\\/|\\.|\\*|\\+|\\?|\\||\\(|\\)|\\[|\\]|\\{|\\}|\\\\|\\$|\\^)", "g"), "\\$1") } function ma(a, b) {
            for (var c =
-1, d = 0, f = a.length; d < f; d++) if (a[d] == b) c = d; else a[d] > b && a[d]--; c != -1 && a.splice(c, 1)
        } function ua(a, b) { b = b.split(","); for (var c = [], d = 0, f = a.aoColumns.length; d < f; d++) for (var e = 0; e < f; e++) if (a.aoColumns[d].sName == b[e]) { c.push(e); break } return c }



        function ca(a) {
            for (var b = "", c = 0, d = a.aoColumns.length; c < d; c++)
                b += a.aoColumns[c].sName + ","; if (b.length == d) return ""; 
                return b.slice(0, -1)
        }
           
            function H(a, b, c) {
            a = a.sTableId === "" ? "DataTables warning: " + c : "DataTables warning (table id = '" + a.sTableId + "'): " + c; if (b === 0) if (n.sErrMode ==
"alert") alert(a); else throw a; else typeof console != "undefined" && typeof console.log != "undefined" && console.log(a)
        } function da(a) { a.aoData.splice(0, a.aoData.length); a.aiDisplayMaster.splice(0, a.aiDisplayMaster.length); a.aiDisplay.splice(0, a.aiDisplay.length); E(a) } function na(a) {
            if (!(!a.oFeatures.bStateSave || typeof a.bDestroying != "undefined")) {
                var b, c, d, f = "{"; f += '"iCreate":' + (new Date).getTime() + ","; f += '"iStart":' + a._iDisplayStart + ","; f += '"iEnd":' + a._iDisplayEnd + ","; f += '"iLength":' + a._iDisplayLength +
","; f += '"sFilter":"' + encodeURIComponent(a.oPreviousSearch.sSearch) + '",'; f += '"sFilterEsc":' + !a.oPreviousSearch.bRegex + ","; f += '"aaSorting":[ '; for (b = 0; b < a.aaSorting.length; b++) f += "[" + a.aaSorting[b][0] + ',"' + a.aaSorting[b][1] + '"],'; f = f.substring(0, f.length - 1); f += "],"; f += '"aaSearchCols":[ '; for (b = 0; b < a.aoPreSearchCols.length; b++) f += '["' + encodeURIComponent(a.aoPreSearchCols[b].sSearch) + '",' + !a.aoPreSearchCols[b].bRegex + "],"; f = f.substring(0, f.length - 1); f += "],"; f += '"abVisCols":[ '; for (b = 0; b < a.aoColumns.length; b++) f +=
a.aoColumns[b].bVisible + ","; f = f.substring(0, f.length - 1); f += "]"; b = 0; for (c = a.aoStateSave.length; b < c; b++) { d = a.aoStateSave[b].fn(a, f); if (d !== "") f = d } f += "}"; Ka(a.sCookiePrefix + a.sInstance, f, a.iCookieDuration, a.sCookiePrefix, a.fnCookieCallback)
            } 
        } function La(a, b) {
            if (a.oFeatures.bStateSave) {
                var c, d, f; d = oa(a.sCookiePrefix + a.sInstance); if (d !== null && d !== "") {
                    try { c = typeof j.parseJSON == "function" ? j.parseJSON(d.replace(/'/g, '"')) : eval("(" + d + ")") } catch (e) { return } d = 0; for (f = a.aoStateLoad.length; d < f; d++) if (!a.aoStateLoad[d].fn(a,
c)) return; a.oLoadedState = j.extend(true, {}, c); a._iDisplayStart = c.iStart; a.iInitDisplayStart = c.iStart; a._iDisplayEnd = c.iEnd; a._iDisplayLength = c.iLength; a.oPreviousSearch.sSearch = decodeURIComponent(c.sFilter); a.aaSorting = c.aaSorting.slice(); a.saved_aaSorting = c.aaSorting.slice(); if (typeof c.sFilterEsc != "undefined") a.oPreviousSearch.bRegex = !c.sFilterEsc; if (typeof c.aaSearchCols != "undefined") for (d = 0; d < c.aaSearchCols.length; d++) a.aoPreSearchCols[d] = { sSearch: decodeURIComponent(c.aaSearchCols[d][0]), bRegex: !c.aaSearchCols[d][1] };
                    if (typeof c.abVisCols != "undefined") { b.saved_aoColumns = []; for (d = 0; d < c.abVisCols.length; d++) { b.saved_aoColumns[d] = {}; b.saved_aoColumns[d].bVisible = c.abVisCols[d] } } 
                } 
            } 
        } function Ka(a, b, c, d, f) {
            var e = new Date; e.setTime(e.getTime() + c * 1E3); c = qa.location.pathname.split("/"); a = a + "_" + c.pop().replace(/[\/:]/g, "").toLowerCase(); var i; if (f !== null) { i = typeof j.parseJSON == "function" ? j.parseJSON(b) : eval("(" + b + ")"); b = f(a, i, e.toGMTString(), c.join("/") + "/") } else b = a + "=" + encodeURIComponent(b) + "; expires=" + e.toGMTString() +
"; path=" + c.join("/") + "/"; f = ""; e = 9999999999999; if ((oa(a) !== null ? p.cookie.length : b.length + p.cookie.length) + 10 > 4096) { a = p.cookie.split(";"); for (var h = 0, k = a.length; h < k; h++) if (a[h].indexOf(d) != -1) { var l = a[h].split("="); try { i = eval("(" + decodeURIComponent(l[1]) + ")") } catch (q) { continue } if (typeof i.iCreate != "undefined" && i.iCreate < e) { f = l[0]; e = i.iCreate } } if (f !== "") p.cookie = f + "=; expires=Thu, 01-Jan-1970 00:00:01 GMT; path=" + c.join("/") + "/" } p.cookie = b
        } function oa(a) {
            var b = qa.location.pathname.split("/"); a = a + "_" +
b[b.length - 1].replace(/[\/:]/g, "").toLowerCase() + "="; b = p.cookie.split(";"); for (var c = 0; c < b.length; c++) { for (var d = b[c]; d.charAt(0) == " "; ) d = d.substring(1, d.length); if (d.indexOf(a) === 0) return decodeURIComponent(d.substring(a.length, d.length)) } return null
        } function fa(a) {
            a = a.getElementsByTagName("tr"); if (a.length == 1) return a[0].getElementsByTagName("th"); var b = [], c = [], d, f, e, i, h, k, l = function (I, Y, N) { for (; typeof I[Y][N] != "undefined"; ) N++; return N }, q = function (I) { if (typeof b[I] == "undefined") b[I] = [] }; d = 0; for (i =
a.length; d < i; d++) { q(d); var t = 0, G = []; f = 0; for (h = a[d].childNodes.length; f < h; f++) if (a[d].childNodes[f].nodeName.toUpperCase() == "TD" || a[d].childNodes[f].nodeName.toUpperCase() == "TH") G.push(a[d].childNodes[f]); f = 0; for (h = G.length; f < h; f++) { var J = G[f].getAttribute("colspan") * 1, B = G[f].getAttribute("rowspan") * 1; if (!J || J === 0 || J === 1) { k = l(b, d, t); b[d][k] = G[f].nodeName.toUpperCase() == "TD" ? 4 : G[f]; if (B || B === 0 || B === 1) for (e = 1; e < B; e++) { q(d + e); b[d + e][k] = 2 } t++ } else { k = l(b, d, t); for (e = 0; e < J; e++) b[d][k + e] = 3; t += J } } } d = 0; for (i =
b.length; d < i; d++) { f = 0; for (h = b[d].length; f < h; f++) if (typeof b[d][f] == "object" && typeof c[f] == "undefined") c[f] = b[d][f] } return c
        } function Ma() {
            var a = p.createElement("p"), b = a.style; b.width = "100%"; b.height = "200px"; var c = p.createElement("div"); b = c.style; b.position = "absolute"; b.top = "0px"; b.left = "0px"; b.visibility = "hidden"; b.width = "200px"; b.height = "150px"; b.overflow = "hidden"; c.appendChild(a); p.body.appendChild(c); b = a.offsetWidth; c.style.overflow = "scroll"; a = a.offsetWidth; if (b == a) a = c.clientWidth; p.body.removeChild(c);
            return b - a
        } function L(a, b, c) { for (var d = 0, f = b.length; d < f; d++) for (var e = 0, i = b[d].childNodes.length; e < i; e++) if (b[d].childNodes[e].nodeType == 1) typeof c != "undefined" ? a(b[d].childNodes[e], c[d].childNodes[e]) : a(b[d].childNodes[e]) } function o(a, b, c, d) { if (typeof d == "undefined") d = c; if (typeof b[c] != "undefined") a[d] = b[c] } this.oApi = {}; this.fnDraw = function (a) { var b = A(this[n.iApiIndex]); if (typeof a != "undefined" && a === false) { E(b); C(b) } else W(b) }; this.fnFilter = function (a, b, c, d, f) {
            var e = A(this[n.iApiIndex]); if (e.oFeatures.bFilter) {
                if (typeof c ==
"undefined") c = false; if (typeof d == "undefined") d = true; if (typeof f == "undefined") f = true; if (typeof b == "undefined" || b === null) { P(e, { sSearch: a, bRegex: c, bSmart: d }, 1); if (f && typeof e.aanFeatures.f != "undefined") { b = e.aanFeatures.f; c = 0; for (d = b.length; c < d; c++) j("input", b[c]).val(a) } } else { e.aoPreSearchCols[b].sSearch = a; e.aoPreSearchCols[b].bRegex = c; e.aoPreSearchCols[b].bSmart = d; P(e, e.oPreviousSearch, 1) } 
            } 
        }; this.fnSettings = function () { return A(this[n.iApiIndex]) }; this.fnVersionCheck = n.fnVersionCheck; this.fnSort = function (a) {
            var b =
A(this[n.iApiIndex]); b.aaSorting = a; O(b)
        }; this.fnSortListener = function (a, b, c) { ba(A(this[n.iApiIndex]), a, b, c) }; this.fnAddData = function (a, b) { if (a.length === 0) return []; var c = [], d, f = A(this[n.iApiIndex]); if (typeof a[0] == "object") for (var e = 0; e < a.length; e++) { d = v(f, a[e]); if (d == -1) return c; c.push(d) } else { d = v(f, a); if (d == -1) return c; c.push(d) } f.aiDisplay = f.aiDisplayMaster.slice(); if (typeof b == "undefined" || b) W(f); return c }; this.fnDeleteRow = function (a, b, c) {
            var d = A(this[n.iApiIndex]); a = typeof a == "object" ? Q(d, a) :
a; var f = d.aoData.splice(a, 1), e = j.inArray(a, d.aiDisplay); d.asDataSearch.splice(e, 1); ma(d.aiDisplayMaster, a); ma(d.aiDisplay, a); typeof b == "function" && b.call(this, d, f); if (d._iDisplayStart >= d.aiDisplay.length) { d._iDisplayStart -= d._iDisplayLength; if (d._iDisplayStart < 0) d._iDisplayStart = 0 } if (typeof c == "undefined" || c) { E(d); C(d) } return f
        }; this.fnClearTable = function (a) { var b = A(this[n.iApiIndex]); da(b); if (typeof a == "undefined" || a) C(b) }; this.fnOpen = function (a, b, c) {
            var d = A(this[n.iApiIndex]); this.fnClose(a); var f =
p.createElement("tr"), e = p.createElement("td"); f.appendChild(e); e.className = c; e.colSpan = S(d); e.innerHTML = b; b = j("tr", d.nTBody); j.inArray(a, b) != -1 && j(f).insertAfter(a); d.aoOpenRows.push({ nTr: f, nParent: a }); return f
        }; this.fnClose = function (a) { for (var b = A(this[n.iApiIndex]), c = 0; c < b.aoOpenRows.length; c++) if (b.aoOpenRows[c].nParent == a) { (a = b.aoOpenRows[c].nTr.parentNode) && a.removeChild(b.aoOpenRows[c].nTr); b.aoOpenRows.splice(c, 1); return 0 } return 1 }; this.fnGetData = function (a) {
            var b = A(this[n.iApiIndex]); if (typeof a !=
"undefined") { a = typeof a == "object" ? Q(b, a) : a; return b.aoData[a]._aData } return V(b)
        }; this.fnGetNodes = function (a) { var b = A(this[n.iApiIndex]); if (typeof a != "undefined") return b.aoData[a].nTr; return R(b) }; this.fnGetPosition = function (a) {
            var b = A(this[n.iApiIndex]); if (a.nodeName.toUpperCase() == "TR") return Q(b, a); else if (a.nodeName.toUpperCase() == "TD") for (var c = Q(b, a.parentNode), d = 0, f = 0; f < b.aoColumns.length; f++) if (b.aoColumns[f].bVisible) { if (b.aoData[c].nTr.getElementsByTagName("td")[f - d] == a) return [c, f - d, f] } else d++;
            return null
        }; this.fnUpdate = function (a, b, c, d, f) {
            var e = A(this[n.iApiIndex]), i; b = typeof b == "object" ? Q(e, b) : b; if (typeof a != "object") { i = a; e.aoData[b]._aData[c] = i; if (e.aoColumns[c].fnRender !== null) { i = e.aoColumns[c].fnRender({ iDataRow: b, iDataColumn: c, aData: e.aoData[b]._aData, oSettings: e }); if (e.aoColumns[c].bUseRendered) e.aoData[b]._aData[c] = i } c = M(e, c); if (c !== null) e.aoData[b].nTr.getElementsByTagName("td")[c].innerHTML = i } else {
                if (a.length != e.aoColumns.length) {
                    H(e, 0, "An array passed to fnUpdate must have the same number of columns as the table in question - in this case " +
e.aoColumns.length); return 1
                } for (var h = 0; h < a.length; h++) { i = a[h]; e.aoData[b]._aData[h] = i; if (e.aoColumns[h].fnRender !== null) { i = e.aoColumns[h].fnRender({ iDataRow: b, iDataColumn: h, aData: e.aoData[b]._aData, oSettings: e }); if (e.aoColumns[h].bUseRendered) e.aoData[b]._aData[h] = i } c = M(e, h); if (c !== null) e.aoData[b].nTr.getElementsByTagName("td")[c].innerHTML = i } 
            } a = j.inArray(b, e.aiDisplay); e.asDataSearch[a] = ka(e, e.aoData[b]._aData); if (typeof f == "undefined" || f) X(e); if (typeof d == "undefined" || d) W(e); return 0
        }; this.fnSetColumnVis =
function (a, b, c) {
    var d = A(this[n.iApiIndex]), f, e; e = d.aoColumns.length; var i, h, k, l, q; if (d.aoColumns[a].bVisible != b) {
        l = j(">tr", d.nTHead)[0]; i = j(">tr", d.nTFoot)[0]; q = []; h = []; for (f = 0; f < e; f++) { q.push(d.aoColumns[f].nTh); h.push(d.aoColumns[f].nTf) } if (b) {
            for (f = b = 0; f < a; f++) d.aoColumns[f].bVisible && b++; if (b >= S(d)) {
                l.appendChild(q[a]); l = j(">tr", d.nTHead); f = 1; for (e = l.length; f < e; f++) l[f].appendChild(d.aoColumns[a].anThExtra[f - 1]); if (i) {
                    i.appendChild(h[a]); l = j(">tr", d.nTFoot); f = 1; for (e = l.length; f < e; f++) l[f].appendChild(d.aoColumns[a].anTfExtra[f -
1])
                } f = 0; for (e = d.aoData.length; f < e; f++) { i = d.aoData[f]._anHidden[a]; d.aoData[f].nTr.appendChild(i) } 
            } else {
                for (f = a; f < e; f++) { k = M(d, f); if (k !== null) break } l.insertBefore(q[a], l.getElementsByTagName("th")[k]); l = j(">tr", d.nTHead); f = 1; for (e = l.length; f < e; f++) { q = j(l[f]).children(); l[f].insertBefore(d.aoColumns[a].anThExtra[f - 1], q[k]) } if (i) { i.insertBefore(h[a], i.getElementsByTagName("th")[k]); l = j(">tr", d.nTFoot); f = 1; for (e = l.length; f < e; f++) { q = j(l[f]).children(); l[f].insertBefore(d.aoColumns[a].anTfExtra[f - 1], q[k]) } } Z(d);
                f = 0; for (e = d.aoData.length; f < e; f++) { i = d.aoData[f]._anHidden[a]; d.aoData[f].nTr.insertBefore(i, j(">td:eq(" + k + ")", d.aoData[f].nTr)[0]) } 
            } d.aoColumns[a].bVisible = true
        } else {
            l.removeChild(q[a]); f = 0; for (e = d.aoColumns[a].anThExtra.length; f < e; f++) { k = d.aoColumns[a].anThExtra[f]; k.parentNode.removeChild(k) } if (i) { i.removeChild(h[a]); f = 0; for (e = d.aoColumns[a].anTfExtra.length; f < e; f++) { k = d.aoColumns[a].anTfExtra[f]; k.parentNode.removeChild(k) } } h = Z(d); f = 0; for (e = d.aoData.length; f < e; f++) {
                i = h[f * d.aoColumns.length + a *
1]; d.aoData[f]._anHidden[a] = i; i.parentNode.removeChild(i)
            } d.aoColumns[a].bVisible = false
        } f = 0; for (e = d.aoOpenRows.length; f < e; f++) d.aoOpenRows[f].nTr.colSpan = S(d); if (typeof c == "undefined" || c) { X(d); C(d) } na(d)
    } 
}; this.fnPageChange = function (a, b) { var c = A(this[n.iApiIndex]); ea(c, a); E(c); if (typeof b == "undefined" || b) C(c) }; this.fnDestroy = function () {
    var a = A(this[n.iApiIndex]), b = a.nTableWrapper.parentNode, c = a.nTBody, d, f; a.bDestroying = true; d = 0; for (f = a.aoColumns.length; d < f; d++) a.aoColumns[d].bVisible === false && this.fnSetColumnVis(d,
true); j("tbody>tr>td." + a.oClasses.sRowEmpty, a.nTable).parent().remove(); if (a.nTable != a.nTHead.parentNode) { j(">thead", a.nTable).remove(); a.nTable.appendChild(a.nTHead) } if (a.nTFoot && a.nTable != a.nTFoot.parentNode) { j(">tfoot", a.nTable).remove(); a.nTable.appendChild(a.nTFoot) } a.nTable.parentNode.removeChild(a.nTable); j(a.nTableWrapper).remove(); a.aaSorting = []; a.aaSortingFixed = []; T(a); j(R(a)).removeClass(a.asStripClasses.join(" ")); if (a.bJUI) {
        j("th", a.nTHead).removeClass([n.oStdClasses.sSortable, n.oJUIClasses.sSortableAsc,
n.oJUIClasses.sSortableDesc, n.oJUIClasses.sSortableNone].join(" ")); j("th span", a.nTHead).remove()
    } else j("th", a.nTHead).removeClass([n.oStdClasses.sSortable, n.oStdClasses.sSortableAsc, n.oStdClasses.sSortableDesc, n.oStdClasses.sSortableNone].join(" ")); b.appendChild(a.nTable); d = 0; for (f = a.aoData.length; d < f; d++) c.appendChild(a.aoData[d].nTr); a.nTable.style.width = u(a.sDestroyWidth); j(">tr:even", c).addClass(a.asDestoryStrips[0]); j(">tr:odd", c).addClass(a.asDestoryStrips[1]); d = 0; for (f = D.length; d < f; d++) D[d] ==
a && D.splice(d, 1)
}; this.fnAdjustColumnSizing = function (a) { var b = A(this[n.iApiIndex]); X(b); if (typeof a == "undefined" || a) this.fnDraw(false); else if (b.oScroll.sX !== "" || b.oScroll.sY !== "") this.oApi._fnScrollDraw(b) }; for (var pa in n.oApi) if (pa) this[pa] = r(pa); this.oApi._fnExternApiFunc = r; this.oApi._fnInitalise = s; this.oApi._fnLanguageProcess = y; this.oApi._fnAddColumn = F; this.oApi._fnColumnOptions = x; this.oApi._fnAddData = v; this.oApi._fnGatherData = z; this.oApi._fnDrawHead = U; this.oApi._fnDraw = C; this.oApi._fnReDraw =
W; this.oApi._fnAjaxUpdate = sa; this.oApi._fnAjaxUpdateDraw = ta; this.oApi._fnAddOptionsHtml = ra; this.oApi._fnFeatureHtmlTable = ya; this.oApi._fnScrollDraw = Ba; this.oApi._fnAjustColumnSizing = X; this.oApi._fnFeatureHtmlFilter = wa; this.oApi._fnFilterComplete = P; this.oApi._fnFilterCustom = Ea; this.oApi._fnFilterColumn = Da; this.oApi._fnFilter = Ca; this.oApi._fnBuildSearchArray = ha; this.oApi._fnBuildSearchRow = ka; this.oApi._fnFilterCreateSearch = ia; this.oApi._fnDataToSearch = ja; this.oApi._fnSort = O; this.oApi._fnSortAttachListener =
ba; this.oApi._fnSortingClasses = T; this.oApi._fnFeatureHtmlPaginate = Aa; this.oApi._fnPageChange = ea; this.oApi._fnFeatureHtmlInfo = za; this.oApi._fnUpdateInfo = Fa; this.oApi._fnFeatureHtmlLength = va; this.oApi._fnFeatureHtmlProcessing = xa; this.oApi._fnProcessingDisplay = K; this.oApi._fnVisibleToColumnIndex = ga; this.oApi._fnColumnIndexToVisible = M; this.oApi._fnNodeToDataIndex = Q; this.oApi._fnVisbleColumns = S; this.oApi._fnCalculateEnd = E; this.oApi._fnConvertToWidth = Ga; this.oApi._fnCalculateColumnWidths = $; this.oApi._fnScrollingWidthAdjust =
Ia; this.oApi._fnGetWidestNode = Ha; this.oApi._fnGetMaxLenString = Ja; this.oApi._fnStringToCss = u; this.oApi._fnArrayCmp = Oa; this.oApi._fnDetectType = aa; this.oApi._fnSettingsFromNode = A; this.oApi._fnGetDataMaster = V; this.oApi._fnGetTrNodes = R; this.oApi._fnGetTdNodes = Z; this.oApi._fnEscapeRegex = la; this.oApi._fnDeleteIndex = ma; this.oApi._fnReOrderIndex = ua; this.oApi._fnColumnOrdering = ca; this.oApi._fnLog = H; this.oApi._fnClearTable = da; this.oApi._fnSaveState = na; this.oApi._fnLoadState = La; this.oApi._fnCreateCookie = Ka; this.oApi._fnReadCookie =
oa; this.oApi._fnGetUniqueThs = fa; this.oApi._fnScrollBarWidth = Ma; this.oApi._fnApplyToChildren = L; this.oApi._fnMap = o; var Na = this; return this.each(function () {
    var a = 0, b, c, d, f; a = 0; for (b = D.length; a < b; a++) {
        if (D[a].nTable == this) if (typeof g == "undefined" || typeof g.bRetrieve != "undefined" && g.bRetrieve === true) return D[a].oInstance; else if (typeof g.bDestroy != "undefined" && g.bDestroy === true) { D[a].oInstance.fnDestroy(); break } else {
            H(D[a], 0, "Cannot reinitialise DataTable.\n\nTo retrieve the DataTables object for this table, please pass either no arguments to the dataTable() function, or set bRetrieve to true. Alternatively, to destory the old table and create a new one, set bDestroy to true (note that a lot of changes to the configuration can be made through the API which is usually much faster).");
            return
        } if (D[a].sTableId !== "" && D[a].sTableId == this.getAttribute("id")) { D.splice(a, 1); break } 
    } var e = new m; D.push(e); var i = false, h = false; a = this.getAttribute("id"); if (a !== null) { e.sTableId = a; e.sInstance = a } else e.sInstance = n._oExternConfig.iNextUnique++; if (this.nodeName.toLowerCase() != "table") H(e, 0, "Attempted to initialise DataTables on a node which is not a table: " + this.nodeName); else {
        e.oInstance = Na; e.nTable = this; e.oApi = Na.oApi; e.sDestroyWidth = j(this).width(); if (typeof g != "undefined" && g !== null) {
            e.oInit =
g; o(e.oFeatures, g, "bPaginate"); o(e.oFeatures, g, "bLengthChange"); o(e.oFeatures, g, "bFilter"); o(e.oFeatures, g, "bSort"); o(e.oFeatures, g, "bInfo"); o(e.oFeatures, g, "bProcessing"); o(e.oFeatures, g, "bAutoWidth"); o(e.oFeatures, g, "bSortClasses"); o(e.oFeatures, g, "bServerSide"); o(e.oScroll, g, "sScrollX", "sX"); o(e.oScroll, g, "sScrollXInner", "sXInner"); o(e.oScroll, g, "sScrollY", "sY"); o(e.oScroll, g, "bScrollCollapse", "bCollapse"); o(e.oScroll, g, "bScrollInfinite", "bInfinite"); o(e.oScroll, g, "iScrollLoadGap", "iLoadGap");
            o(e.oScroll, g, "bScrollAutoCss", "bAutoCss"); o(e, g, "asStripClasses"); o(e, g, "fnRowCallback"); o(e, g, "fnHeaderCallback"); o(e, g, "fnFooterCallback"); o(e, g, "fnCookieCallback"); o(e, g, "fnInitComplete"); o(e, g, "fnServerData"); o(e, g, "fnFormatNumber"); o(e, g, "aaSorting"); o(e, g, "aaSortingFixed"); o(e, g, "aLengthMenu"); o(e, g, "sPaginationType"); o(e, g, "sAjaxSource"); o(e, g, "iCookieDuration"); o(e, g, "sCookiePrefix"); o(e, g, "sDom"); o(e, g, "oSearch", "oPreviousSearch"); o(e, g, "aoSearchCols", "aoPreSearchCols"); o(e, g, "iDisplayLength",
"_iDisplayLength"); o(e, g, "bJQueryUI", "bJUI"); o(e.oLanguage, g, "fnInfoCallback");
            typeof g.fnDrawCallback == "function" && e.aoDrawCallback.push({ fn: g.fnDrawCallback, sName: "user" });

 typeof g.fnStateSaveCallback == "function" && e.aoStateSave.push({ fn: g.fnStateSaveCallback, sName: "user" }); typeof g.fnStateLoadCallback == "function" && e.aoStateLoad.push({ fn: g.fnStateLoadCallback, sName: "user" }); e.oFeatures.bServerSide && e.oFeatures.bSort && e.oFeatures.bSortClasses && e.aoDrawCallback.push({ fn: T, sName: "server_side_sort_classes" });
            if (typeof g.bJQueryUI != "undefined" && g.bJQueryUI) { e.oClasses = n.oJUIClasses; if (typeof g.sDom == "undefined") e.sDom = '<"H"lfr>t<"F"ip>' } if (e.oScroll.sX !== "" || e.oScroll.sY !== "") e.oScroll.iBarWidth = Ma(); if (typeof g.iDisplayStart != "undefined" && typeof e.iInitDisplayStart == "undefined") { e.iInitDisplayStart = g.iDisplayStart; e._iDisplayStart = g.iDisplayStart } if (typeof g.bStateSave != "undefined") { e.oFeatures.bStateSave = g.bStateSave; La(e, g); e.aoDrawCallback.push({ fn: na, sName: "state_save" }) } if (typeof g.aaData != "undefined") h =
true; if (typeof g != "undefined" && typeof g.aoData != "undefined") g.aoColumns = g.aoData; if (typeof g.oLanguage != "undefined") if (typeof g.oLanguage.sUrl != "undefined" && g.oLanguage.sUrl !== "") { e.oLanguage.sUrl = g.oLanguage.sUrl; j.getJSON(e.oLanguage.sUrl, null, function (q) { y(e, q, true) }); i = true } else y(e, g.oLanguage, false)
        } else g = {}; if (typeof g.asStripClasses == "undefined") { e.asStripClasses.push(e.oClasses.sStripOdd); e.asStripClasses.push(e.oClasses.sStripEven) } c = false; d = j("tbody>tr", this); a = 0; for (b = e.asStripClasses.length; a <
b; a++) if (d.filter(":lt(2)").hasClass(e.asStripClasses[a])) { c = true; break } if (c) { e.asDestoryStrips = ["", ""]; if (j(d[0]).hasClass(e.oClasses.sStripOdd)) e.asDestoryStrips[0] += e.oClasses.sStripOdd + " "; if (j(d[0]).hasClass(e.oClasses.sStripEven)) e.asDestoryStrips[0] += e.oClasses.sStripEven; if (j(d[1]).hasClass(e.oClasses.sStripOdd)) e.asDestoryStrips[1] += e.oClasses.sStripOdd + " "; if (j(d[1]).hasClass(e.oClasses.sStripEven)) e.asDestoryStrips[1] += e.oClasses.sStripEven; d.removeClass(e.asStripClasses.join(" ")) } a = this.getElementsByTagName("thead");
        c = a.length === 0 ? [] : fa(a[0]); var k; if (typeof g.aoColumns == "undefined") { k = []; a = 0; for (b = c.length; a < b; a++) k.push(null) } else k = g.aoColumns; a = 0; for (b = k.length; a < b; a++) { if (typeof g.saved_aoColumns != "undefined" && g.saved_aoColumns.length == b) { if (k[a] === null) k[a] = {}; k[a].bVisible = g.saved_aoColumns[a].bVisible } F(e, c ? c[a] : null) } if (typeof g.aoColumnDefs != "undefined") for (a = g.aoColumnDefs.length - 1; a >= 0; a--) {
            var l = g.aoColumnDefs[a].aTargets; j.isArray(l) || H(e, 1, "aTargets must be an array of targets, not a " + typeof l);
            c = 0; for (d = l.length; c < d; c++) if (typeof l[c] == "number" && l[c] >= 0) { for (; e.aoColumns.length <= l[c]; ) F(e); x(e, l[c], g.aoColumnDefs[a]) } else if (typeof l[c] == "number" && l[c] < 0) x(e, e.aoColumns.length + l[c], g.aoColumnDefs[a]); else if (typeof l[c] == "string") { b = 0; for (f = e.aoColumns.length; b < f; b++) if (l[c] == "_all" || e.aoColumns[b].nTh.className.indexOf(l[c]) != -1) x(e, b, g.aoColumnDefs[a]) } 
        } if (typeof k != "undefined") { a = 0; for (b = k.length; a < b; a++) x(e, a, k[a]) } a = 0; for (b = e.aaSorting.length; a < b; a++) {
            if (e.aaSorting[a][0] >= e.aoColumns.length) e.aaSorting[a][0] =
0; k = e.aoColumns[e.aaSorting[a][0]]; if (typeof e.aaSorting[a][2] == "undefined") e.aaSorting[a][2] = 0; if (typeof g.aaSorting == "undefined" && typeof e.saved_aaSorting == "undefined") e.aaSorting[a][1] = k.asSorting[0]; c = 0; for (d = k.asSorting.length; c < d; c++) if (e.aaSorting[a][1] == k.asSorting[c]) { e.aaSorting[a][2] = c; break } 
        } T(e); this.getElementsByTagName("thead").length === 0 && this.appendChild(p.createElement("thead")); this.getElementsByTagName("tbody").length === 0 && this.appendChild(p.createElement("tbody")); e.nTHead = this.getElementsByTagName("thead")[0];
        e.nTBody = this.getElementsByTagName("tbody")[0]; if (this.getElementsByTagName("tfoot").length > 0) e.nTFoot = this.getElementsByTagName("tfoot")[0]; if (h) for (a = 0; a < g.aaData.length; a++) v(e, g.aaData[a]); else z(e); e.aiDisplay = e.aiDisplayMaster.slice(); e.bInitialised = true; i === false && s(e)
    } 
})
    } 
})(jQuery, window, document);
/*
 * Jeditable - jQuery in place edit plugin
 *
 * Copyright (c) 2006-2008 Mika Tuupola, Dylan Verheul
 *
 * Licensed under the MIT license:
 *   http://www.opensource.org/licenses/mit-license.php
 *
 * Project home:
 *   http://www.appelsiini.net/projects/jeditable
 *
 * Based on editable by Dylan Verheul <dylan_at_dyve.net>:
 *    http://www.dyve.net/jquery/?editable
 *
 */

/**
  * Version 1.6.2
  *
  * ** means there is basic unit tests for this parameter. 
  *
  * @name  Jeditable
  * @type  jQuery
  * @param String  target             (POST) URL or function to send edited content to **
  * @param Hash    options            additional options 
  * @param String  options[method]    method to use to send edited content (POST or PUT) **
  * @param Function options[callback] Function to run after submitting edited content **
  * @param String  options[name]      POST parameter name of edited content
  * @param String  options[id]        POST parameter name of edited div id
  * @param Hash    options[submitdata] Extra parameters to send when submitting edited content.
  * @param String  options[type]      text, textarea or select (or any 3rd party input type) **
  * @param Integer options[rows]      number of rows if using textarea ** 
  * @param Integer options[cols]      number of columns if using textarea **
  * @param Mixed   options[height]    'auto', 'none' or height in pixels **
  * @param Mixed   options[width]     'auto', 'none' or width in pixels **
  * @param String  options[loadurl]   URL to fetch input content before editing **
  * @param String  options[loadtype]  Request type for load url. Should be GET or POST.
  * @param String  options[loadtext]  Text to display while loading external content.
  * @param Mixed   options[loaddata]  Extra parameters to pass when fetching content before editing.
  * @param Mixed   options[data]      Or content given as paramameter. String or function.**
  * @param String  options[indicator] indicator html to show when saving
  * @param String  options[tooltip]   optional tooltip text via title attribute **
  * @param String  options[event]     jQuery event such as 'click' of 'dblclick' **
  * @param String  options[submit]    submit button value, empty means no button **
  * @param String  options[cancel]    cancel button value, empty means no button **
  * @param String  options[cssclass]  CSS class to apply to input form. 'inherit' to copy from parent. **
  * @param String  options[style]     Style to apply to input form 'inherit' to copy from parent. **
  * @param String  options[select]    true or false, when true text is highlighted ??
  * @param String  options[placeholder] Placeholder text or html to insert when element is empty. **
  * @param String  options[onblur]    'cancel', 'submit', 'ignore' or function ??
  *             
  * @param Function options[onsubmit] function(settings, original) { ... } called before submit
  * @param Function options[onreset]  function(settings, original) { ... } called before reset
  * @param Function options[onerror]  function(settings, original, xhr) { ... } called on error
  *             
  * @param Hash    options[ajaxoptions]  jQuery Ajax options. See docs.jquery.com.
  *             
  */

(function($) {

    $.fn.editable = function(target, options) {
    
        var settings = {
            target     : target,
            name       : 'value',
            id         : 'id',
            type       : 'text',
            width      : 'auto',
            height     : 'auto',
            event      : 'click',
            onblur     : 'cancel',
            loadtype   : 'GET',
            loadtext   : 'Loading...',
            placeholder: 'Click to edit',
            loaddata   : {},
            submitdata : {},
            ajaxoptions: {}
        };
        
        if(options) {
            $.extend(settings, options);
        }
    
        /* setup some functions */
        var plugin   = $.editable.types[settings.type].plugin || function() { };
        var submit   = $.editable.types[settings.type].submit || function() { };
        var buttons  = $.editable.types[settings.type].buttons 
                    || $.editable.types['defaults'].buttons;
        var content  = $.editable.types[settings.type].content 
                    || $.editable.types['defaults'].content;
        var element  = $.editable.types[settings.type].element 
                    || $.editable.types['defaults'].element;
        var reset    = $.editable.types[settings.type].reset 
                    || $.editable.types['defaults'].reset;
        var callback = settings.callback || function() { };
        var onsubmit = settings.onsubmit || function() { };
        var onreset  = settings.onreset  || function() { };
        var onerror  = settings.onerror  || reset;
        
        /* add custom event if it does not exist */
        if  (!$.isFunction($(this)[settings.event])) {
            $.fn[settings.event] = function(fn){
                return fn ? this.bind(settings.event, fn) : this.trigger(settings.event);
            }
        }
          
        /* show tooltip */
        $(this).attr('title', settings.tooltip);
        
        settings.autowidth  = 'auto' == settings.width;
        settings.autoheight = 'auto' == settings.height;

        return this.each(function() {
                        
            /* save this to self because this changes when scope changes */
            var self = this;  
                   
            /* inlined block elements lose their width and height after first edit */
            /* save them for later use as workaround */
            var savedwidth  = $(self).width();
            var savedheight = $(self).height();
            
            /* if element is empty add something clickable (if requested) */
            if (!$.trim($(this).html())) {
                $(this).html(settings.placeholder);
            }
            
            $(this)[settings.event](function(e) {

                /* prevent throwing an exeption if edit field is clicked again */
                if (self.editing) {
                    return;
                }

                /* remove tooltip */
                $(self).removeAttr('title');
                
                /* figure out how wide and tall we are, saved width and height */
                /* are workaround for http://dev.jquery.com/ticket/2190 */
                if (0 == $(self).width()) {
                    //$(self).css('visibility', 'hidden');
                    settings.width  = savedwidth;
                    settings.height = savedheight;
                } else {
                    if (settings.width != 'none') {
                        settings.width = 
                            //settings.autowidth ? savedwidth  : settings.width
                            settings.autowidth ? $(self).width()  : settings.width;
                    }
                    if (settings.height != 'none') {
                        settings.height = 
                            //settings.autoheight ? savedheight : settings.height;
                            settings.autoheight ? $(self).height() : settings.height;
                    }
                }
                //$(this).css('visibility', '');
                
                /* remove placeholder text, replace is here because of IE */
                if ($(this).html().toLowerCase().replace(/;/, '') == 
                    settings.placeholder.toLowerCase().replace(/;/, '')) {
                        $(this).html('');
                }
                                
                self.editing    = true;
                self.revert     = $(self).html();
                $(self).html('');

                /* create the form object */
                var form = $('<form />');
                
                /* apply css or style or both */
                if (settings.cssclass) {
                    if ('inherit' == settings.cssclass) {
                        form.attr('class', $(self).attr('class'));
                    } else {
                        form.attr('class', settings.cssclass);
                    }
                }

                if (settings.style) {
                    if ('inherit' == settings.style) {
                        form.attr('style', $(self).attr('style'));
                        /* IE needs the second line or display wont be inherited */
                        form.css('display', $(self).css('display'));                
                    } else {
                        form.attr('style', settings.style);
                    }
                }

                /* add main input element to form and store it in input */
                var input = element.apply(form, [settings, self]);

                /* set input content via POST, GET, given data or existing value */
                var input_content;
                
                if (settings.loadurl) {
                    var t = setTimeout(function() {
                        input.disabled = true;
                        content.apply(form, [settings.loadtext, settings, self]);
                    }, 100);

                    var loaddata = {};
                    loaddata[settings.id] = self.id;
                    if ($.isFunction(settings.loaddata)) {
                        $.extend(loaddata, settings.loaddata.apply(self, [self.revert, settings]));
                    } else {
                        $.extend(loaddata, settings.loaddata);
                    }
                    $.ajax({
                       type : settings.loadtype,
                       url  : settings.loadurl,
                       data : loaddata,
                       async : false,
                       success: function(result) {
                          window.clearTimeout(t);
                          input_content = result;
                          input.disabled = false;
                       }
                    });
                } else if (settings.data) {
                    input_content = settings.data;
                    if ($.isFunction(settings.data)) {
                        input_content = settings.data.apply(self, [self.revert, settings]);
                    }
                } else {
                    input_content = self.revert; 
                }
                content.apply(form, [input_content, settings, self]);

                input.attr('name', settings.name);
        
                /* add buttons to the form */
                buttons.apply(form, [settings, self]);
         
                /* add created form to self */
                $(self).append(form);
         
                /* attach 3rd party plugin if requested */
                plugin.apply(form, [settings, self]);

                /* focus to first visible form element */
                $(':input:visible:enabled:first', form).focus();

                /* highlight input contents when requested */
                if (settings.select) {
                    input.select();
                }
        
                /* discard changes if pressing esc */
                input.keydown(function(e) {
                    if (e.keyCode == 27) {
                        e.preventDefault();
                        //self.reset();
                        reset.apply(form, [settings, self]);
                    }
                });

                /* discard, submit or nothing with changes when clicking outside */
                /* do nothing is usable when navigating with tab */
                var t;
                if ('cancel' == settings.onblur) {
                    input.blur(function(e) {
                        /* prevent canceling if submit was clicked */
                        t = setTimeout(function() {
                            reset.apply(form, [settings, self]);
                        }, 500);
                    });
                } else if ('submit' == settings.onblur) {
                    input.blur(function(e) {
                        /* prevent double submit if submit was clicked */
                        t = setTimeout(function() {
                            form.submit();
                        }, 200);
                    });
                } else if ($.isFunction(settings.onblur)) {
                    input.blur(function(e) {
                        settings.onblur.apply(self, [input.val(), settings]);
                    });
                } else {
                    input.blur(function(e) {
                      /* TODO: maybe something here */
                    });
                }

                form.submit(function(e) {

                    if (t) { 
                        clearTimeout(t);
                    }

                    /* do no submit */
                    e.preventDefault(); 
            
                    /* call before submit hook. */
                    /* if it returns false abort submitting */                    
                    if (false !== onsubmit.apply(form, [settings, self])) { 
                        /* custom inputs call before submit hook. */
                        /* if it returns false abort submitting */
                        if (false !== submit.apply(form, [settings, self])) { 

                          /* check if given target is function */
                          if ($.isFunction(settings.target)) {
                              var str = settings.target.apply(self, [input.val(), settings]);
                              $(self).html(str);
                              self.editing = false;
                              callback.apply(self, [self.innerHTML, settings]);
                              /* TODO: this is not dry */                              
                              if (!$.trim($(self).html())) {
                                  $(self).html(settings.placeholder);
                              }
                          } else {
                              /* add edited content and id of edited element to POST */
                              var submitdata = {};
                              submitdata[settings.name] = input.val();
                              submitdata[settings.id] = self.id;
                              /* add extra data to be POST:ed */
                              if ($.isFunction(settings.submitdata)) {
                                  $.extend(submitdata, settings.submitdata.apply(self, [self.revert, settings]));
                              } else {
                                  $.extend(submitdata, settings.submitdata);
                              }

                              /* quick and dirty PUT support */
                              if ('PUT' == settings.method) {
                                  submitdata['_method'] = 'put';
                              }

                              /* show the saving indicator */
                              $(self).html(settings.indicator);
                              
                              /* defaults for ajaxoptions */
                              var ajaxoptions = {
                                  type    : 'POST',
                                  data    : submitdata,
                                  url     : settings.target,
                                  success : function(result, status) {
                                      $(self).html(result);
                                      self.editing = false;
                                      callback.apply(self, [self.innerHTML, settings]);
                                      if (!$.trim($(self).html())) {
                                          $(self).html(settings.placeholder);
                                      }
                                  },
                                  error   : function(xhr, status, error) {
                                      onerror.apply(form, [settings, self, xhr]);
                                  }
                              }
                              
                              /* override with what is given in settings.ajaxoptions */
                              $.extend(ajaxoptions, settings.ajaxoptions);   
                              $.ajax(ajaxoptions);          
                              
                            }
                        }
                    }
                    
                    /* show tooltip again */
                    $(self).attr('title', settings.tooltip);
                    
                    return false;
                });
            });
            
            /* privileged methods */
            this.reset = function(form) {
                /* prevent calling reset twice when blurring */
                if (this.editing) {
                    /* before reset hook, if it returns false abort reseting */
                    if (false !== onreset.apply(form, [settings, self])) { 
                        $(self).html(self.revert);
                        self.editing   = false;
                        if (!$.trim($(self).html())) {
                            $(self).html(settings.placeholder);
                        }
                        /* show tooltip again */
                        $(self).attr('title', settings.tooltip);                
                    }                    
                }
            }            
        });

    };


    $.editable = {
        types: {
            defaults: {
                element : function(settings, original) {
                    var input = $('<input type="hidden"></input>');                
                    $(this).append(input);
                    return(input);
                },
                content : function(string, settings, original) {
                    $(':input:first', this).val(string);
                },
                reset : function(settings, original) {
                  original.reset(this);
                },
                buttons : function(settings, original) {
                    var form = this;
                    if (settings.submit) {
                        /* if given html string use that */
                        if (settings.submit.match(/>$/)) {
                            var submit = $(settings.submit).click(function() {
                                if (submit.attr("type") != "submit") {
                                    form.submit();
                                }
                            });
                        /* otherwise use button with given string as text */
                        } else {
                            var submit = $('<button type="submit" />');
                            submit.html(settings.submit);                            
                        }
                        $(this).append(submit);
                    }
                    if (settings.cancel) {
                        /* if given html string use that */
                        if (settings.cancel.match(/>$/)) {
                            var cancel = $(settings.cancel);
                        /* otherwise use button with given string as text */
                        } else {
                            var cancel = $('<button type="cancel" />');
                            cancel.html(settings.cancel);
                        }
                        $(this).append(cancel);

                        $(cancel).click(function(event) {
                            //original.reset();
                            if ($.isFunction($.editable.types[settings.type].reset)) {
                                var reset = $.editable.types[settings.type].reset;                                                                
                            } else {
                                var reset = $.editable.types['defaults'].reset;                                
                            }
                            reset.apply(form, [settings, original]);
                            return false;
                        });
                    }
                }
            },
            text: {
                element : function(settings, original) {
                    var input = $('<input />');
                    if (settings.width  != 'none') { input.width(settings.width);  }
                    if (settings.height != 'none') { input.height(settings.height); }
                    /* https://bugzilla.mozilla.org/show_bug.cgi?id=236791 */
                    //input[0].setAttribute('autocomplete','off');
                    input.attr('autocomplete','off');
                    $(this).append(input);
                    return(input);
                }
            },
            textarea: {
                element : function(settings, original) {
                    var textarea = $('<textarea />');
                    if (settings.rows) {
                        textarea.attr('rows', settings.rows);
                    } else {
                        textarea.height(settings.height);
                    }
                    if (settings.cols) {
                        textarea.attr('cols', settings.cols);
                    } else {
                        textarea.width(settings.width);
                    }
                    $(this).append(textarea);
                    return(textarea);
                }
            },
            select: {
               element : function(settings, original) {
                    var select = $('<select />');
                    $(this).append(select);
                    return(select);
                },
                content : function(string, settings, original) {
                    if (String == string.constructor) {      
                        eval ('var json = ' + string);
                        for (var key in json) {
                            if (!json.hasOwnProperty(key)) {
                                continue;
                            }
                            if ('selected' == key) {
                                continue;
                            } 
                            var option = $('<option />').val(key).append(json[key]);
                            $('select', this).append(option);    
                        }
                    }
                    /* Loop option again to set selected. IE needed this... */ 
                    $('select', this).children().each(function() {
                        if ($(this).val() == json['selected'] || 
                            $(this).text() == original.revert) {
                                $(this).attr('selected', 'selected');
                        };
                    });
                }
            }
        },

        /* Add new input type */
        addInputType: function(name, input) {
            $.editable.types[name] = input;
        }
    };

})(jQuery);
/*
* Note: While Microsoft is not the author of this file, Microsoft is
* offering you a license subject to the terms of the Microsoft Software
* License Terms for Microsoft ASP.NET Model View Controller 3.
* Microsoft reserves all other rights. The notices below are provided
* for informational purposes only and are not the license terms under
* which Microsoft distributed this file.
*
* jQuery validation plug-in 1.7
*
* http://bassistance.de/jquery-plugins/jquery-plugin-validation/
* http://docs.jquery.com/Plugins/Validation
*
* Copyright (c) 2006 - 2008 Jörn Zaefferer
*
* $Id: jquery.validate.js 6403 2009-06-17 14:27:16Z joern.zaefferer $
*
*/

(function($) {

$.extend($.fn, {
	// http://docs.jquery.com/Plugins/Validation/validate
	validate: function( options ) {

		// if nothing is selected, return nothing; can't chain anyway
		if (!this.length) {
			options && options.debug && window.console && console.warn( "nothing selected, can't validate, returning nothing" );
			return;
		}

		// check if a validator for this form was already created
		var validator = $.data(this[0], 'validator');
		if ( validator ) {
			return validator;
		}
		
		validator = new $.validator( options, this[0] );
		$.data(this[0], 'validator', validator); 
		
		if ( validator.settings.onsubmit ) {
		
			// allow suppresing validation by adding a cancel class to the submit button
			this.find("input, button").filter(".cancel").click(function() {
				validator.cancelSubmit = true;
			});
			
			// when a submitHandler is used, capture the submitting button
			if (validator.settings.submitHandler) {
				this.find("input, button").filter(":submit").click(function() {
					validator.submitButton = this;
				});
			}
		
			// validate the form on submit
			this.submit( function( event ) {
				if ( validator.settings.debug )
					// prevent form submit to be able to see console output
					event.preventDefault();
					
				function handle() {
					if ( validator.settings.submitHandler ) {
						if (validator.submitButton) {
							// insert a hidden input as a replacement for the missing submit button
							var hidden = $("<input type='hidden'/>").attr("name", validator.submitButton.name).val(validator.submitButton.value).appendTo(validator.currentForm);
						}
						validator.settings.submitHandler.call( validator, validator.currentForm );
						if (validator.submitButton) {
							// and clean up afterwards; thanks to no-block-scope, hidden can be referenced
							hidden.remove();
						}
						return false;
					}
					return true;
				}
					
				// prevent submit for invalid forms or custom submit handlers
				if ( validator.cancelSubmit ) {
					validator.cancelSubmit = false;
					return handle();
				}
				if ( validator.form() ) {
					if ( validator.pendingRequest ) {
						validator.formSubmitted = true;
						return false;
					}
					return handle();
				} else {
					validator.focusInvalid();
					return false;
				}
			});
		}
		
		return validator;
	},
	// http://docs.jquery.com/Plugins/Validation/valid
	valid: function() {
        if ( $(this[0]).is('form')) {
            return this.validate().form();
        } else {
            var valid = true;
            var validator = $(this[0].form).validate();
            this.each(function() {
				valid &= validator.element(this);
            });
            return valid;
        }
    },
	// attributes: space seperated list of attributes to retrieve and remove
	removeAttrs: function(attributes) {
		var result = {},
			$element = this;
		$.each(attributes.split(/\s/), function(index, value) {
			result[value] = $element.attr(value);
			$element.removeAttr(value);
		});
		return result;
	},
	// http://docs.jquery.com/Plugins/Validation/rules
	rules: function(command, argument) {
		var element = this[0];
		
		if (command) {
			var settings = $.data(element.form, 'validator').settings;
			var staticRules = settings.rules;
			var existingRules = $.validator.staticRules(element);
			switch(command) {
			case "add":
				$.extend(existingRules, $.validator.normalizeRule(argument));
				staticRules[element.name] = existingRules;
				if (argument.messages)
					settings.messages[element.name] = $.extend( settings.messages[element.name], argument.messages );
				break;
			case "remove":
				if (!argument) {
					delete staticRules[element.name];
					return existingRules;
				}
				var filtered = {};
				$.each(argument.split(/\s/), function(index, method) {
					filtered[method] = existingRules[method];
					delete existingRules[method];
				});
				return filtered;
			}
		}
		
		var data = $.validator.normalizeRules(
		$.extend(
			{},
			$.validator.metadataRules(element),
			$.validator.classRules(element),
			$.validator.attributeRules(element),
			$.validator.staticRules(element)
		), element);
		
		// make sure required is at front
		if (data.required) {
			var param = data.required;
			delete data.required;
			data = $.extend({required: param}, data);
		}
		
		return data;
	}
});

// Custom selectors
$.extend($.expr[":"], {
	// http://docs.jquery.com/Plugins/Validation/blank
	blank: function(a) {return !$.trim("" + a.value);},
	// http://docs.jquery.com/Plugins/Validation/filled
	filled: function(a) {return !!$.trim("" + a.value);},
	// http://docs.jquery.com/Plugins/Validation/unchecked
	unchecked: function(a) {return !a.checked;}
});

// constructor for validator
$.validator = function( options, form ) {
	this.settings = $.extend( true, {}, $.validator.defaults, options );
	this.currentForm = form;
	this.init();
};

$.validator.format = function(source, params) {
	if ( arguments.length == 1 ) 
		return function() {
			var args = $.makeArray(arguments);
			args.unshift(source);
			return $.validator.format.apply( this, args );
		};
	if ( arguments.length > 2 && params.constructor != Array  ) {
		params = $.makeArray(arguments).slice(1);
	}
	if ( params.constructor != Array ) {
		params = [ params ];
	}
	$.each(params, function(i, n) {
		source = source.replace(new RegExp("\\{" + i + "\\}", "g"), n);
	});
	return source;
};

$.extend($.validator, {
	
	defaults: {
		messages: {},
		groups: {},
		rules: {},
		errorClass: "error",
		validClass: "valid",
		errorElement: "label",
		focusInvalid: true,
		errorContainer: $( [] ),
		errorLabelContainer: $( [] ),
		onsubmit: true,
		ignore: [],
		ignoreTitle: false,
		onfocusin: function(element) {
			this.lastActive = element;
				
			// hide error label and remove error class on focus if enabled
			if ( this.settings.focusCleanup && !this.blockFocusCleanup ) {
				this.settings.unhighlight && this.settings.unhighlight.call( this, element, this.settings.errorClass, this.settings.validClass );
				this.errorsFor(element).hide();
			}
		},
		onfocusout: function(element) {
			if ( !this.checkable(element) && (element.name in this.submitted || !this.optional(element)) ) {
				this.element(element);
			}
		},
		onkeyup: function(element) {
			if ( element.name in this.submitted || element == this.lastElement ) {
				this.element(element);
			}
		},
		onclick: function(element) {
			// click on selects, radiobuttons and checkboxes
			if ( element.name in this.submitted )
				this.element(element);
			// or option elements, check parent select in that case
			else if (element.parentNode.name in this.submitted)
				this.element(element.parentNode);
		},
		highlight: function( element, errorClass, validClass ) {
			$(element).addClass(errorClass).removeClass(validClass);
		},
		unhighlight: function( element, errorClass, validClass ) {
			$(element).removeClass(errorClass).addClass(validClass);
		}
	},

	// http://docs.jquery.com/Plugins/Validation/Validator/setDefaults
	setDefaults: function(settings) {
		$.extend( $.validator.defaults, settings );
	},

	messages: {
		required: "This field is required.",
		remote: "Please fix this field.",
		email: "Please enter a valid email address.",
		url: "Please enter a valid URL.",
		date: "Please enter a valid date.",
		dateISO: "Please enter a valid date (ISO).",
		number: "Please enter a valid number.",
		digits: "Please enter only digits.",
		creditcard: "Please enter a valid credit card number.",
		equalTo: "Please enter the same value again.",
		accept: "Please enter a value with a valid extension.",
		maxlength: $.validator.format("Please enter no more than {0} characters."),
		minlength: $.validator.format("Please enter at least {0} characters."),
		rangelength: $.validator.format("Please enter a value between {0} and {1} characters long."),
		range: $.validator.format("Please enter a value between {0} and {1}."),
		max: $.validator.format("Please enter a value less than or equal to {0}."),
		min: $.validator.format("Please enter a value greater than or equal to {0}.")
	},
	
	autoCreateRanges: false,
	
	prototype: {
		
		init: function() {
			this.labelContainer = $(this.settings.errorLabelContainer);
			this.errorContext = this.labelContainer.length && this.labelContainer || $(this.currentForm);
			this.containers = $(this.settings.errorContainer).add( this.settings.errorLabelContainer );
			this.submitted = {};
			this.valueCache = {};
			this.pendingRequest = 0;
			this.pending = {};
			this.invalid = {};
			this.reset();
			
			var groups = (this.groups = {});
			$.each(this.settings.groups, function(key, value) {
				$.each(value.split(/\s/), function(index, name) {
					groups[name] = key;
				});
			});
			var rules = this.settings.rules;
			$.each(rules, function(key, value) {
				rules[key] = $.validator.normalizeRule(value);
			});
			
			function delegate(event) {
				var validator = $.data(this[0].form, "validator"),
					eventType = "on" + event.type.replace(/^validate/, "");
				validator.settings[eventType] && validator.settings[eventType].call(validator, this[0] );
			}
			$(this.currentForm)
				.validateDelegate(":text, :password, :file, select, textarea", "focusin focusout keyup", delegate)
				.validateDelegate(":radio, :checkbox, select, option", "click", delegate);

			if (this.settings.invalidHandler)
				$(this.currentForm).bind("invalid-form.validate", this.settings.invalidHandler);
		},

		// http://docs.jquery.com/Plugins/Validation/Validator/form
		form: function() {
			this.checkForm();
			$.extend(this.submitted, this.errorMap);
			this.invalid = $.extend({}, this.errorMap);
			if (!this.valid())
				$(this.currentForm).triggerHandler("invalid-form", [this]);
			this.showErrors();
			return this.valid();
		},
		
		checkForm: function() {
			this.prepareForm();
			for ( var i = 0, elements = (this.currentElements = this.elements()); elements[i]; i++ ) {
				this.check( elements[i] );
			}
			return this.valid(); 
		},
		
		// http://docs.jquery.com/Plugins/Validation/Validator/element
		element: function( element ) {
			element = this.clean( element );
			this.lastElement = element;
			this.prepareElement( element );
			this.currentElements = $(element);
			var result = this.check( element );
			if ( result ) {
				delete this.invalid[element.name];
			} else {
				this.invalid[element.name] = true;
			}
			if ( !this.numberOfInvalids() ) {
				// Hide error containers on last error
				this.toHide = this.toHide.add( this.containers );
			}
			this.showErrors();
			return result;
		},

		// http://docs.jquery.com/Plugins/Validation/Validator/showErrors
		showErrors: function(errors) {
			if(errors) {
				// add items to error list and map
				$.extend( this.errorMap, errors );
				this.errorList = [];
				for ( var name in errors ) {
					this.errorList.push({
						message: errors[name],
						element: this.findByName(name)[0]
					});
				}
				// remove items from success list
				this.successList = $.grep( this.successList, function(element) {
					return !(element.name in errors);
				});
			}
			this.settings.showErrors
				? this.settings.showErrors.call( this, this.errorMap, this.errorList )
				: this.defaultShowErrors();
		},
		
		// http://docs.jquery.com/Plugins/Validation/Validator/resetForm
		resetForm: function() {
			if ( $.fn.resetForm )
				$( this.currentForm ).resetForm();
			this.submitted = {};
			this.prepareForm();
			this.hideErrors();
			this.elements().removeClass( this.settings.errorClass );
		},
		
		numberOfInvalids: function() {
			return this.objectLength(this.invalid);
		},
		
		objectLength: function( obj ) {
			var count = 0;
			for ( var i in obj )
				count++;
			return count;
		},
		
		hideErrors: function() {
			this.addWrapper( this.toHide ).hide();
		},
		
		valid: function() {
			return this.size() == 0;
		},
		
		size: function() {
			return this.errorList.length;
		},
		
		focusInvalid: function() {
			if( this.settings.focusInvalid ) {
				try {
					$(this.findLastActive() || this.errorList.length && this.errorList[0].element || [])
					.filter(":visible")
					.focus()
					// manually trigger focusin event; without it, focusin handler isn't called, findLastActive won't have anything to find
					.trigger("focusin");
				} catch(e) {
					// ignore IE throwing errors when focusing hidden elements
				}
			}
		},
		
		findLastActive: function() {
			var lastActive = this.lastActive;
			return lastActive && $.grep(this.errorList, function(n) {
				return n.element.name == lastActive.name;
			}).length == 1 && lastActive;
		},
		
		elements: function() {
			var validator = this,
				rulesCache = {};
			
			// select all valid inputs inside the form (no submit or reset buttons)
			// workaround $Query([]).add until http://dev.jquery.com/ticket/2114 is solved
			return $([]).add(this.currentForm.elements)
			.filter(":input")
			.not(":submit, :reset, :image, [disabled]")
			.not( this.settings.ignore )
			.filter(function() {
				!this.name && validator.settings.debug && window.console && console.error( "%o has no name assigned", this);
			
				// select only the first element for each name, and only those with rules specified
				if ( this.name in rulesCache || !validator.objectLength($(this).rules()) )
					return false;
				
				rulesCache[this.name] = true;
				return true;
			});
		},
		
		clean: function( selector ) {
			return $( selector )[0];
		},
		
		errors: function() {
			return $( this.settings.errorElement + "." + this.settings.errorClass, this.errorContext );
		},
		
		reset: function() {
			this.successList = [];
			this.errorList = [];
			this.errorMap = {};
			this.toShow = $([]);
			this.toHide = $([]);
			this.currentElements = $([]);
		},
		
		prepareForm: function() {
			this.reset();
			this.toHide = this.errors().add( this.containers );
		},
		
		prepareElement: function( element ) {
			this.reset();
			this.toHide = this.errorsFor(element);
		},
	
		check: function( element ) {
			element = this.clean( element );
			
			// if radio/checkbox, validate first element in group instead
			if (this.checkable(element)) {
				element = this.findByName( element.name )[0];
			}
			
			var rules = $(element).rules();
			var dependencyMismatch = false;
			for( method in rules ) {
				var rule = { method: method, parameters: rules[method] };
				try {
					var result = $.validator.methods[method].call( this, element.value.replace(/\r/g, ""), element, rule.parameters );
					
					// if a method indicates that the field is optional and therefore valid,
					// don't mark it as valid when there are no other rules
					if ( result == "dependency-mismatch" ) {
						dependencyMismatch = true;
						continue;
					}
					dependencyMismatch = false;
					
					if ( result == "pending" ) {
						this.toHide = this.toHide.not( this.errorsFor(element) );
						return;
					}
					
					if( !result ) {
						this.formatAndAdd( element, rule );
						return false;
					}
				} catch(e) {
					this.settings.debug && window.console && console.log("exception occured when checking element " + element.id
						 + ", check the '" + rule.method + "' method", e);
					throw e;
				}
			}
			if (dependencyMismatch)
				return;
			if ( this.objectLength(rules) )
				this.successList.push(element);
			return true;
		},
		
		// return the custom message for the given element and validation method
		// specified in the element's "messages" metadata
		customMetaMessage: function(element, method) {
			if (!$.metadata)
				return;
			
			var meta = this.settings.meta
				? $(element).metadata()[this.settings.meta]
				: $(element).metadata();
			
			return meta && meta.messages && meta.messages[method];
		},
		
		// return the custom message for the given element name and validation method
		customMessage: function( name, method ) {
			var m = this.settings.messages[name];
			return m && (m.constructor == String
				? m
				: m[method]);
		},
		
		// return the first defined argument, allowing empty strings
		findDefined: function() {
			for(var i = 0; i < arguments.length; i++) {
				if (arguments[i] !== undefined)
					return arguments[i];
			}
			return undefined;
		},
		
		defaultMessage: function( element, method) {
			return this.findDefined(
				this.customMessage( element.name, method ),
				this.customMetaMessage( element, method ),
				// title is never undefined, so handle empty string as undefined
				!this.settings.ignoreTitle && element.title || undefined,
				$.validator.messages[method],
				"<strong>Warning: No message defined for " + element.name + "</strong>"
			);
		},
		
		formatAndAdd: function( element, rule ) {
			var message = this.defaultMessage( element, rule.method ),
				theregex = /\$?\{(\d+)\}/g;
			if ( typeof message == "function" ) {
				message = message.call(this, rule.parameters, element);
			} else if (theregex.test(message)) {
				message = jQuery.format(message.replace(theregex, '{$1}'), rule.parameters);
			}			
			this.errorList.push({
				message: message,
				element: element
			});
			
			this.errorMap[element.name] = message;
			this.submitted[element.name] = message;
		},
		
		addWrapper: function(toToggle) {
			if ( this.settings.wrapper )
				toToggle = toToggle.add( toToggle.parent( this.settings.wrapper ) );
			return toToggle;
		},
		
		defaultShowErrors: function() {
			for ( var i = 0; this.errorList[i]; i++ ) {
				var error = this.errorList[i];
				this.settings.highlight && this.settings.highlight.call( this, error.element, this.settings.errorClass, this.settings.validClass );
				this.showLabel( error.element, error.message );
			}
			if( this.errorList.length ) {
				this.toShow = this.toShow.add( this.containers );
			}
			if (this.settings.success) {
				for ( var i = 0; this.successList[i]; i++ ) {
					this.showLabel( this.successList[i] );
				}
			}
			if (this.settings.unhighlight) {
				for ( var i = 0, elements = this.validElements(); elements[i]; i++ ) {
					this.settings.unhighlight.call( this, elements[i], this.settings.errorClass, this.settings.validClass );
				}
			}
			this.toHide = this.toHide.not( this.toShow );
			this.hideErrors();
			this.addWrapper( this.toShow ).show();
		},
		
		validElements: function() {
			return this.currentElements.not(this.invalidElements());
		},
		
		invalidElements: function() {
			return $(this.errorList).map(function() {
				return this.element;
			});
		},
		
		showLabel: function(element, message) {
			var label = this.errorsFor( element );
			if ( label.length ) {
				// refresh error/success class
				label.removeClass().addClass( this.settings.errorClass );
			
				// check if we have a generated label, replace the message then
				label.attr("generated") && label.html(message);
			} else {
				// create label
				label = $("<" + this.settings.errorElement + "/>")
					.attr({"for":  this.idOrName(element), generated: true})
					.addClass(this.settings.errorClass)
					.html(message || "");
				if ( this.settings.wrapper ) {
					// make sure the element is visible, even in IE
					// actually showing the wrapped element is handled elsewhere
					label = label.hide().show().wrap("<" + this.settings.wrapper + "/>").parent();
				}
				if ( !this.labelContainer.append(label).length )
					this.settings.errorPlacement
						? this.settings.errorPlacement(label, $(element) )
						: label.insertAfter(element);
			}
			if ( !message && this.settings.success ) {
				label.text("");
				typeof this.settings.success == "string"
					? label.addClass( this.settings.success )
					: this.settings.success( label );
			}
			this.toShow = this.toShow.add(label);
		},
		
		errorsFor: function(element) {
			var name = this.idOrName(element);
    		return this.errors().filter(function() {
				return $(this).attr('for') == name;
			});
		},
		
		idOrName: function(element) {
			return this.groups[element.name] || (this.checkable(element) ? element.name : element.id || element.name);
		},

		checkable: function( element ) {
			return /radio|checkbox/i.test(element.type);
		},
		
		findByName: function( name ) {
			// select by name and filter by form for performance over form.find("[name=...]")
			var form = this.currentForm;
			return $(document.getElementsByName(name)).map(function(index, element) {
				return element.form == form && element.name == name && element  || null;
			});
		},
		
		getLength: function(value, element) {
			switch( element.nodeName.toLowerCase() ) {
			case 'select':
				return $("option:selected", element).length;
			case 'input':
				if( this.checkable( element) )
					return this.findByName(element.name).filter(':checked').length;
			}
			return value.length;
		},
	
		depend: function(param, element) {
			return this.dependTypes[typeof param]
				? this.dependTypes[typeof param](param, element)
				: true;
		},
	
		dependTypes: {
			"boolean": function(param, element) {
				return param;
			},
			"string": function(param, element) {
				return !!$(param, element.form).length;
			},
			"function": function(param, element) {
				return param(element);
			}
		},
		
		optional: function(element) {
			return !$.validator.methods.required.call(this, $.trim(element.value), element) && "dependency-mismatch";
		},
		
		startRequest: function(element) {
			if (!this.pending[element.name]) {
				this.pendingRequest++;
				this.pending[element.name] = true;
			}
		},
		
		stopRequest: function(element, valid) {
			this.pendingRequest--;
			// sometimes synchronization fails, make sure pendingRequest is never < 0
			if (this.pendingRequest < 0)
				this.pendingRequest = 0;
			delete this.pending[element.name];
			if ( valid && this.pendingRequest == 0 && this.formSubmitted && this.form() ) {
				$(this.currentForm).submit();
				this.formSubmitted = false;
			} else if (!valid && this.pendingRequest == 0 && this.formSubmitted) {
				$(this.currentForm).triggerHandler("invalid-form", [this]);
				this.formSubmitted = false;
			}
		},
		
		previousValue: function(element) {
			return $.data(element, "previousValue") || $.data(element, "previousValue", {
				old: null,
				valid: true,
				message: this.defaultMessage( element, "remote" )
			});
		}
		
	},
	
	classRuleSettings: {
		required: {required: true},
		email: {email: true},
		url: {url: true},
		date: {date: true},
		dateISO: {dateISO: true},
		dateDE: {dateDE: true},
		number: {number: true},
		numberDE: {numberDE: true},
		digits: {digits: true},
		creditcard: {creditcard: true}
	},
	
	addClassRules: function(className, rules) {
		className.constructor == String ?
			this.classRuleSettings[className] = rules :
			$.extend(this.classRuleSettings, className);
	},
	
	classRules: function(element) {
		var rules = {};
		var classes = $(element).attr('class');
		classes && $.each(classes.split(' '), function() {
			if (this in $.validator.classRuleSettings) {
				$.extend(rules, $.validator.classRuleSettings[this]);
			}
		});
		return rules;
	},
	
	attributeRules: function(element) {
		var rules = {};
		var $element = $(element);
		
		for (method in $.validator.methods) {
			var value = $element.attr(method);
			if (value) {
				rules[method] = value;
			}
		}
		
		// maxlength may be returned as -1, 2147483647 (IE) and 524288 (safari) for text inputs
		if (rules.maxlength && /-1|2147483647|524288/.test(rules.maxlength)) {
			delete rules.maxlength;
		}
		
		return rules;
	},
	
	metadataRules: function(element) {
		if (!$.metadata) return {};
		
		var meta = $.data(element.form, 'validator').settings.meta;
		return meta ?
			$(element).metadata()[meta] :
			$(element).metadata();
	},
	
	staticRules: function(element) {
		var rules = {};
		var validator = $.data(element.form, 'validator');
		if (validator.settings.rules) {
			rules = $.validator.normalizeRule(validator.settings.rules[element.name]) || {};
		}
		return rules;
	},
	
	normalizeRules: function(rules, element) {
		// handle dependency check
		$.each(rules, function(prop, val) {
			// ignore rule when param is explicitly false, eg. required:false
			if (val === false) {
				delete rules[prop];
				return;
			}
			if (val.param || val.depends) {
				var keepRule = true;
				switch (typeof val.depends) {
					case "string":
						keepRule = !!$(val.depends, element.form).length;
						break;
					case "function":
						keepRule = val.depends.call(element, element);
						break;
				}
				if (keepRule) {
					rules[prop] = val.param !== undefined ? val.param : true;
				} else {
					delete rules[prop];
				}
			}
		});
		
		// evaluate parameters
		$.each(rules, function(rule, parameter) {
			rules[rule] = $.isFunction(parameter) ? parameter(element) : parameter;
		});
		
		// clean number parameters
		$.each(['minlength', 'maxlength', 'min', 'max'], function() {
			if (rules[this]) {
				rules[this] = Number(rules[this]);
			}
		});
		$.each(['rangelength', 'range'], function() {
			if (rules[this]) {
				rules[this] = [Number(rules[this][0]), Number(rules[this][1])];
			}
		});
		
		if ($.validator.autoCreateRanges) {
			// auto-create ranges
			if (rules.min && rules.max) {
				rules.range = [rules.min, rules.max];
				delete rules.min;
				delete rules.max;
			}
			if (rules.minlength && rules.maxlength) {
				rules.rangelength = [rules.minlength, rules.maxlength];
				delete rules.minlength;
				delete rules.maxlength;
			}
		}
		
		// To support custom messages in metadata ignore rule methods titled "messages"
		if (rules.messages) {
			delete rules.messages;
		}
		
		return rules;
	},
	
	// Converts a simple string to a {string: true} rule, e.g., "required" to {required:true}
	normalizeRule: function(data) {
		if( typeof data == "string" ) {
			var transformed = {};
			$.each(data.split(/\s/), function() {
				transformed[this] = true;
			});
			data = transformed;
		}
		return data;
	},
	
	// http://docs.jquery.com/Plugins/Validation/Validator/addMethod
	addMethod: function(name, method, message) {
		$.validator.methods[name] = method;
		$.validator.messages[name] = message != undefined ? message : $.validator.messages[name];
		if (method.length < 3) {
			$.validator.addClassRules(name, $.validator.normalizeRule(name));
		}
	},

	methods: {

		// http://docs.jquery.com/Plugins/Validation/Methods/required
		required: function(value, element, param) {
			// check if dependency is met
			if ( !this.depend(param, element) )
				return "dependency-mismatch";
			switch( element.nodeName.toLowerCase() ) {
			case 'select':
				// could be an array for select-multiple or a string, both are fine this way
				var val = $(element).val();
				return val && val.length > 0;
			case 'input':
				if ( this.checkable(element) )
					return this.getLength(value, element) > 0;
			default:
				return $.trim(value).length > 0;
			}
		},
		
		// http://docs.jquery.com/Plugins/Validation/Methods/remote
		remote: function(value, element, param) {
			if ( this.optional(element) )
				return "dependency-mismatch";
			
			var previous = this.previousValue(element);
			if (!this.settings.messages[element.name] )
				this.settings.messages[element.name] = {};
			previous.originalMessage = this.settings.messages[element.name].remote;
			this.settings.messages[element.name].remote = previous.message;
			
			param = typeof param == "string" && {url:param} || param; 
			
			if ( previous.old !== value ) {
				previous.old = value;
				var validator = this;
				this.startRequest(element);
				var data = {};
				data[element.name] = value;
				$.ajax($.extend(true, {
					url: param,
					mode: "abort",
					port: "validate" + element.name,
					dataType: "json",
					data: data,
					success: function(response) {
						validator.settings.messages[element.name].remote = previous.originalMessage;
						var valid = response === true;
						if ( valid ) {
							var submitted = validator.formSubmitted;
							validator.prepareElement(element);
							validator.formSubmitted = submitted;
							validator.successList.push(element);
							validator.showErrors();
						} else {
							var errors = {};
							var message = (previous.message = response || validator.defaultMessage( element, "remote" ));
							errors[element.name] = $.isFunction(message) ? message(value) : message;
							validator.showErrors(errors);
						}
						previous.valid = valid;
						validator.stopRequest(element, valid);
					}
				}, param));
				return "pending";
			} else if( this.pending[element.name] ) {
				return "pending";
			}
			return previous.valid;
		},

		// http://docs.jquery.com/Plugins/Validation/Methods/minlength
		minlength: function(value, element, param) {
			return this.optional(element) || this.getLength($.trim(value), element) >= param;
		},
		
		// http://docs.jquery.com/Plugins/Validation/Methods/maxlength
		maxlength: function(value, element, param) {
			return this.optional(element) || this.getLength($.trim(value), element) <= param;
		},
		
		// http://docs.jquery.com/Plugins/Validation/Methods/rangelength
		rangelength: function(value, element, param) {
			var length = this.getLength($.trim(value), element);
			return this.optional(element) || ( length >= param[0] && length <= param[1] );
		},
		
		// http://docs.jquery.com/Plugins/Validation/Methods/min
		min: function( value, element, param ) {
			return this.optional(element) || value >= param;
		},
		
		// http://docs.jquery.com/Plugins/Validation/Methods/max
		max: function( value, element, param ) {
			return this.optional(element) || value <= param;
		},
		
		// http://docs.jquery.com/Plugins/Validation/Methods/range
		range: function( value, element, param ) {
			return this.optional(element) || ( value >= param[0] && value <= param[1] );
		},
		
		// http://docs.jquery.com/Plugins/Validation/Methods/email
		email: function(value, element) {
			// contributed by Scott Gonzalez: http://projects.scottsplayground.com/email_address_validation/
			return this.optional(element) || /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i.test(value);
		},
	
		// http://docs.jquery.com/Plugins/Validation/Methods/url
		url: function(value, element) {
			// contributed by Scott Gonzalez: http://projects.scottsplayground.com/iri/
			return this.optional(element) || /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(value);
		},
        
		// http://docs.jquery.com/Plugins/Validation/Methods/date
		date: function(value, element) {
			return this.optional(element) || !/Invalid|NaN/.test(new Date(value));
		},
	
		// http://docs.jquery.com/Plugins/Validation/Methods/dateISO
		dateISO: function(value, element) {
			return this.optional(element) || /^\d{4}[\/-]\d{1,2}[\/-]\d{1,2}$/.test(value);
		},
	
		// http://docs.jquery.com/Plugins/Validation/Methods/number
		number: function(value, element) {
			return this.optional(element) || /^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(value);
		},
	
		// http://docs.jquery.com/Plugins/Validation/Methods/digits
		digits: function(value, element) {
			return this.optional(element) || /^\d+$/.test(value);
		},
		
		// http://docs.jquery.com/Plugins/Validation/Methods/creditcard
		// based on http://en.wikipedia.org/wiki/Luhn
		creditcard: function(value, element) {
			if ( this.optional(element) )
				return "dependency-mismatch";
			// accept only digits and dashes
			if (/[^0-9-]+/.test(value))
				return false;
			var nCheck = 0,
				nDigit = 0,
				bEven = false;

			value = value.replace(/\D/g, "");

			for (var n = value.length - 1; n >= 0; n--) {
				var cDigit = value.charAt(n);
				var nDigit = parseInt(cDigit, 10);
				if (bEven) {
					if ((nDigit *= 2) > 9)
						nDigit -= 9;
				}
				nCheck += nDigit;
				bEven = !bEven;
			}

			return (nCheck % 10) == 0;
		},
		
		// http://docs.jquery.com/Plugins/Validation/Methods/accept
		accept: function(value, element, param) {
			param = typeof param == "string" ? param.replace(/,/g, '|') : "png|jpe?g|gif";
			return this.optional(element) || value.match(new RegExp(".(" + param + ")$", "i")); 
		},
		
		// http://docs.jquery.com/Plugins/Validation/Methods/equalTo
		equalTo: function(value, element, param) {
			// bind to the blur event of the target in order to revalidate whenever the target field is updated
			// TODO find a way to bind the event just once, avoiding the unbind-rebind overhead
			var target = $(param).unbind(".validate-equalTo").bind("blur.validate-equalTo", function() {
				$(element).valid();
			});
			return value == target.val();
		}
		
	}
	
});

// deprecated, use $.validator.format instead
$.format = $.validator.format;

})(jQuery);

// ajax mode: abort
// usage: $.ajax({ mode: "abort"[, port: "uniqueport"]});
// if mode:"abort" is used, the previous request on that port (port can be undefined) is aborted via XMLHttpRequest.abort() 
;(function($) {
	var ajax = $.ajax;
	var pendingRequests = {};
	$.ajax = function(settings) {
		// create settings for compatibility with ajaxSetup
		settings = $.extend(settings, $.extend({}, $.ajaxSettings, settings));
		var port = settings.port;
		if (settings.mode == "abort") {
			if ( pendingRequests[port] ) {
				pendingRequests[port].abort();
			}
			return (pendingRequests[port] = ajax.apply(this, arguments));
		}
		return ajax.apply(this, arguments);
	};
})(jQuery);

// provides cross-browser focusin and focusout events
// IE has native support, in other browsers, use event caputuring (neither bubbles)

// provides delegate(type: String, delegate: Selector, handler: Callback) plugin for easier event delegation
// handler is only called when $(event.target).is(delegate), in the scope of the jquery-object for event.target 
;(function($) {
	// only implement if not provided by jQuery core (since 1.4)
	// TODO verify if jQuery 1.4's implementation is compatible with older jQuery special-event APIs
	if (!jQuery.event.special.focusin && !jQuery.event.special.focusout && document.addEventListener) {
		$.each({
			focus: 'focusin',
			blur: 'focusout'	
		}, function( original, fix ){
			$.event.special[fix] = {
				setup:function() {
					this.addEventListener( original, handler, true );
				},
				teardown:function() {
					this.removeEventListener( original, handler, true );
				},
				handler: function(e) {
					arguments[0] = $.event.fix(e);
					arguments[0].type = fix;
					return $.event.handle.apply(this, arguments);
				}
			};
			function handler(e) {
				e = $.event.fix(e);
				e.type = fix;
				return $.event.handle.call(this, e);
			}
		});
	};
	$.extend($.fn, {
		validateDelegate: function(delegate, type, handler) {
			return this.bind(type, function(event) {
				var target = $(event.target);
				if (target.is(delegate)) {
					return handler.apply(target, arguments);
				}
			});
		}
	});
})(jQuery);
/*jshint eqnull:true */
/*!
* jQuery Cookie Plugin v1.1
* https://github.com/carhartl/jquery-cookie
*
* Copyright 2011, Klaus Hartl
* Dual licensed under the MIT or GPL Version 2 licenses.
* http://www.opensource.org/licenses/mit-license.php
* http://www.opensource.org/licenses/GPL-2.0
*/
(function($, document) {

    var pluses = /\+/g;
    function raw(s) {
        return s;
    }
    function decoded(s) {
        return decodeURIComponent(s.replace(pluses, ' '));
    }

    $.cookie = function(key, value, options) {

        // key and at least value given, set cookie...
        if (arguments.length > 1 && (!/Object/.test(Object.prototype.toString.call(value)) || value == null)) {
            options = $.extend({}, $.cookie.defaults, options);

            if (value == null) {
                options.expires = -1;
            }

            if (typeof options.expires === 'number') {
                var days = options.expires, t = options.expires = new Date();
                t.setDate(t.getDate() + days);
            }

            value = String(value);

            return (document.cookie = [
            encodeURIComponent(key), '=', options.raw ? value : encodeURIComponent(value),
            options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
            options.path ? '; path=' + options.path : '',
            options.domain ? '; domain=' + options.domain : '',
            options.secure ? '; secure' : ''
            ].join(''));
        }

        // key and possibly options given, get cookie...
        options = value || $.cookie.defaults || {};
        var decode = options.raw ? raw : decoded;
        var cookies = document.cookie.split('; ');
        for (var i = 0, parts; (parts = cookies[i] && cookies[i].split('=')); i++) {
            if (decode(parts.shift()) === key) {
                return decode(parts.join('='));
            }
        }
        return null;
    };

    $.cookie.defaults = {};

})(jQuery, document);

// Python ajax csrf token issue fix
jQuery(document).ajaxSend(function(event, xhr, settings) {
    function safeMethod(method) {
        return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
    }

    if (!safeMethod(settings.type) && !settings.crossDomain) {
        xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
    }
});

function makeSublist(parent,child,isSubselectOptional,childVal)
{
  $("body").append("<select style='display:none' id='"+parent+child+"'></select>");
  $('#'+parent+child).html($("#"+child+" option"));

  var parentValue = $('#'+parent).attr('value');
  $('#'+child).html($("#"+parent+child+" .sub_"+parentValue).clone());

  childVal = (typeof childVal == "undefined")? "" : childVal ;
  $("#"+child).val(childVal).attr('selected','selected');

  $('#'+parent).change(function(){
    var parentValue = $('#'+parent).attr('value');
    $('#'+child).html($("#"+parent+child+" .sub_"+parentValue).clone());
    if(isSubselectOptional) $('#'+child).prepend("<option value='none' selected='selected'> — Select — </option>");

    $('#'+child).trigger("change");
    $('#'+child).focus();
  });
}
