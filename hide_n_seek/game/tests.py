from django.urls import reverse
from django.test import TestCase, Client
from .models import Room, Player

import json

class GameTests(TestCase):
    def setUp(self):
        # 设置测试客户端
        self.client = Client()

    def test_join_game(self):
        # 测试数据
        nickname = 'Paul'
        role = 'hider'
        room_id = 'Caladan'

        # 模拟POST请求到join游戏的端点
        response = self.client.post(reverse('join_game'), {
            'nickname': nickname,
            'role': role,
            'roomId': room_id,
        }, content_type='application/json')

        # 确认响应状态码是200
        self.assertEqual(response.status_code, 200)

        # 尝试从响应中解析JSON数据
        json_response = response.json()

        # 检查响应数据
        self.assertIn('player_id', json_response)
        self.assertIn('room_id', json_response)
        self.assertEqual(json_response['status'], 'joined')

        # 验证是否真的创建了玩家和房间对象
        self.assertTrue(Player.objects.filter(nickname=nickname).exists())
        self.assertTrue(Room.objects.filter(room_id=room_id).exists())

        # 获取玩家和房间对象
        player = Player.objects.get(nickname=nickname)
        room = Room.objects.get(room_id=room_id)

        # 验证玩家和房间是否关联正确
        self.assertEqual(player.room, room)
        self.assertEqual(player.role, role)
