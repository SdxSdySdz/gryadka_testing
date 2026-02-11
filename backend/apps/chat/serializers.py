from rest_framework import serializers
from apps.chat.models import ChatRoom, Message


class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.display_name', read_only=True)
    sender_is_admin = serializers.BooleanField(source='sender.is_admin', read_only=True)
    image = serializers.SerializerMethodField()
    video = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ['id', 'room', 'sender', 'sender_name', 'sender_is_admin', 'text', 'image', 'video', 'is_read', 'created_at']
        read_only_fields = ['id', 'room', 'sender', 'is_read', 'created_at']

    def get_image(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None

    def get_video(self, obj):
        if obj.video:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.video.url)
            return obj.video.url
        return None


class ChatRoomSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source='client.display_name', read_only=True)
    client_username = serializers.CharField(source='client.username', read_only=True)
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = ChatRoom
        fields = ['id', 'client', 'client_name', 'client_username', 'last_message', 'unread_count', 'updated_at']

    def get_last_message(self, obj):
        msg = obj.messages.order_by('-created_at').first()
        if msg:
            return MessageSerializer(msg, context=self.context).data
        return None

    def get_unread_count(self, obj):
        return obj.messages.filter(is_read=False, sender=obj.client).count()
