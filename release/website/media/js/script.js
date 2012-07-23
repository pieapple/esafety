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

function Draw(arg) {
    if (arg.nodeType) {
        this.canvas = arg;
    } else if (typeof arg == 'string') {
        this.canvas = document.getElementById(arg);
    } else {
        return;
    }
    this.init();
}

Draw.prototype = {
    init: function() {
        var that = this;
        if (!this.canvas.getContext) {
            return;
        }
        this.context = this.canvas.getContext('2d');
        this.canvas.onselectstart = function () {
            return false;  //修复chrome下光标样式的问题
        };
        this.canvas.onmousedown = function(event) {
            that.drawBegin(event);
        };
    },
    drawBegin: function(e) {
        var that = this,
        stage_info = this.canvas.getBoundingClientRect();
        window.getSelection ? window.getSelection().removeAllRanges() :
            document.selection.empty();  //清除文本的选中
        this.context.moveTo(
            e.clientX - stage_info.left,
            e.clientY - stage_info.top
        );
        document.onmousemove = function(event) {
            that.drawing(event);
        };
        document.onmouseup = this.drawEnd;
    },
    drawing: function(e) {
        var stage_info = this.canvas.getBoundingClientRect();
        this.context.lineTo(
            e.clientX - stage_info.left,
            e.clientY - stage_info.top
        );
        this.context.stroke();
    },
    drawEnd: function() {
         document.onmousemove = document.onmouseup = null;
    }
};

jQuery.validator.methods.laterThanToday = function(value, element, param) {
    var today = new Date();
    var date = new Date(Date.parse(value.replace("-", "/")));
    return (date >= today);
};

jQuery.validator.methods.lessEqualThan = function(value, element, param) {
     var target = $(param).unbind(".validate-equalTo").bind("blur.validate-equalTo", function() {
         $(element).valid();
     });
     return parseInt(value,10) <= parseInt(target.val(),10);
 }

/*
 * Translated default messages for the jQuery validation plugin.
 * Locale: CN
 */
jQuery.extend(jQuery.validator.messages, {
    required: "必选字段",
    remote: "请修正该字段",
    email: "请输入正确格式的电子邮件",
    url: "请输入合法的网址",
    date: "请输入合法的日期",
    dateISO: "请输入合法的日期 (ISO).",
    number: "请输入合法的数字",
    digits: "只能输入整数",
    creditcard: "请输入合法的信用卡号",
    equalTo: "请再次输入相同的值",
    accept: "请输入拥有合法后缀名的字符串",
    maxlength: jQuery.validator.format("请输入一个长度最多是 {0} 的字符串"),
    minlength: jQuery.validator.format("请输入一个长度最少是 {0} 的字符串"),
    rangelength: jQuery.validator.format("请输入一个长度介于 {0} 和 {1} 之间的字符串"),
    range: jQuery.validator.format("请输入一个介于 {0} 和 {1} 之间的值"),
    max: jQuery.validator.format("请输入一个最大为 {0} 的值"),
    min: jQuery.validator.format("请输入一个最小为 {0} 的值")
});


jQuery(function ($) {
    $.datepicker.regional['zh-CN'] = {
        closeText: '关闭',
        prevText: '&#x3c;上月',
        nextText: '下月&#x3e;',
        currentText: '今天',
        monthNames: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
        monthNamesShort: ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'],
        dayNames: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
        dayNamesShort: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
        dayNamesMin: ['日', '一', '二', '三', '四', '五', '六'],
        weekHeader: '周',
        dateFormat: 'mm/dd/yy',
        firstDay: 1,
        isRTL: false,
        showMonthAfterYear: true,
        yearSuffix: '年'
    };
    $.datepicker.setDefaults($.datepicker.regional['zh-CN']);
});

$.metadata.setType("attr", "validate");
