from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.http import JsonResponse
from django.views import View
from .models import Player, Room
import json

@method_decorator(csrf_exempt, name='dispatch')
class JoinGameView(View):
    def post(self, request):
        try:
            # 解析请求体中的JSON数据
            data = json.loads(request.body)
            nickname = data.get('nickname')
            role = data.get('role')
            room_id = data.get('roomId')
            
            if not nickname or not role or not room_id:
                return JsonResponse({'error': 'Missing fields'}, status=400)
            
            # 确保角色是'hider'或'seeker'
            if role not in ['hider', 'seeker']:
                return JsonResponse({'error': 'Invalid role'}, status=400)
            
            # 获取或创建房间
            room, created = Room.objects.get_or_create(room_id=room_id)
            
            # 创建新玩家
            player = Player.objects.create(nickname=nickname, role=role, room=room)
            
            return JsonResponse({'player_id': player.id, 'room_id': room.id, 'status': 'joined'})
        
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
