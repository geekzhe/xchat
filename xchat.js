$(function () {
    // 获取页面对象
    var msgContainer = $('#msgContainer');
    var inputMsg = $('#inputMsg');
    var sendBtn = $('#sendBtn');

    // 全局变量
    var serverIP = '127.0.0.1';
    var serverPort = 7000;
    var serverAPI = '/chat/';
    var srcUser = GetRequest()['user'];


    function GetRequest() {
        var url = location.search; //获取url中"?"符后的字串
        var theRequest = new Object();
        if (url.indexOf("?") != -1) {
            var str = url.substr(1);
            var strs = str.split("&");
            for (var i = 0; i < strs.length; i++) {
                theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
            }
        }
        return theRequest;
    }

    if ("WebSocket" in window) {
        /*
            与服务器建立 websocket 链接
        */
        // 格式：ws://服务器IP:服务器端口/chat/本地用户名
        // ws://127.0.0.1:7000/chat/tom
        var url = "ws://" + serverIP + ":" + serverPort + serverAPI + srcUser;
        // console.log(url);
        var ws = new WebSocket(url);

        /*
            连接建立成功时要做的处理
        */
        ws.onopen = function () {
            console.log('已连接到服务器！');
        };

        /*
            处理页面发送按钮点击事件(发送消息)
        */
        sendBtn.click(function () {
            // 获取要发送的消息
            var iMsg = inputMsg.val();

            // 组织要发送的数据
            var sendData = {
                'msg': iMsg
            };

            // 发送数据
            ws.send(JSON.stringify(sendData));

            // 将消息添加到消息框(靠右侧显示)
            var right_msg = iMsg;
            var right = '<div class="right"><span>' + right_msg + '</span></div>';
            msgContainer.html(msgContainer.html() + right);
            msgContainer.scrolltop = msgContainer.scrollHeight;

            // 清空输入框数据
            inputMsg.val('');
        });

        // 处理输入框中的回车事件，回车时触发发送按钮的点击事件
        inputMsg.keydown(function (event) {
            if (event.key === 'Enter') {
                sendBtn.click();
            }
        });


        /*
            收到消息时要做的处理(将消息显示在页面上)
        */
        ws.onmessage = function (event) {
            var data = JSON.parse(event.data);
            /*
            data 数据格式
            {
                'src_user': '消息发送者',
                'msg': '用户发送的消息',
            }
            */
            // 将消息显示在消息框中(靠左侧显示)
            var left_msg = data['msg'];
            var left = '<div class="left"><span' +
                ' class="fromUser">' +
                data['src_user'] +
                ':&nbsp;&nbsp;</span></span><span>' +
                left_msg +
                '</span></div>';
            msgContainer.html(msgContainer.html() + left);
            msgContainer.scrolltop = msgContainer.scrollHeight;

            // 控制台打印消息
            // console.log(data['msg']);
        };

        /*
            处理连接断开事件
        */
        ws.onclose = function (event) {
            console.log('与服务器连接已断开！');
            console.log(event)
        };

        ws.onerror = function (event) {
            console.log(event)
        }
    } else {
        alert('您的浏览器不支持 WebSocket！');
    }
});