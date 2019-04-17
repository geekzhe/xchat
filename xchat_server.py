import json

from flask import Flask, render_template, request
from geventwebsocket.handler import WebSocketHandler
from gevent.pywsgi import WSGIServer

app = Flask(__name__)

ONLINE_USERS = []


@app.route('/xchat')
def xchat_views():
    return render_template('xchat.html')


@app.route('/chat/<src_user>')
def chat(src_user):
    # 获取 websocket 连接对象
    ws = request.environ.get('wsgi.websocket')

    # 将连接信息添加到在线用户列表中
    print('User %s connected' % src_user)
    conn_info = {
        'src_user': src_user,
        'ws': ws
    }
    ONLINE_USERS.append(conn_info)

    # 循环接收客户端发送的消息，并处理
    while True:
        recv_data = ws.receive()
        print('Receive message from %s : %s' % (src_user, recv_data))

        # 接收到的消息为空时，客户端断开连接
        # 服务端需要将连接信息从在线用户列表中移除，关闭 ws，退出等待消息的循环
        if not recv_data:
            # 将连接信息从在线用户列表中移除
            ONLINE_USERS.remove(conn_info)

            # 关闭 ws
            ws.close()
            print('User %s disconnected' % src_user)

            return 'User Exit'

        # 将接收到的数据转换为字典格式
        # data 格式： {'msg': 'hello tom'}
        data = json.loads(recv_data)
        # dest_user = data['dest_user']
        msg = data['msg']

        # 将消息发送给所有的在线用户
        send_msg_to_all_user(src_user, msg)


def send_msg_to_all_user(src_user, msg):
    """发送消息给所有在线用户户"""
    # [{'src_user':'tom','ws':'<tom_sock>'},
    #  {'src_user':'tony','ws':'<tony_sock>'}]
    for user_info in ONLINE_USERS:
        # 跳过源用户(自己)
        if user_info['src_user'] == src_user:
            continue

        dest_user_ws = user_info['ws']
        send_data = {
            'src_user': src_user,
            'msg': msg,
        }
        print('Send msg to user %s : %s' % (user_info['src_user'], send_data))
        dest_user_ws.send(json.dumps(send_data))


if __name__ == '__main__':
    server = WSGIServer(('0.0.0.0', 7000), app, handler_class=WebSocketHandler)
    print('server start ...')
    server.serve_forever()
