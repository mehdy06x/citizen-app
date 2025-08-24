from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Reclamation

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'password']
        extra_kwargs = {'password': {'write_only': True}}# Ensure password is write-only none can read it 
    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user
    

class ReclamationSerializer(serializers.ModelSerializer):
    # Expose the author's username for frontend display
    author_username = serializers.CharField(source='author.username', read_only=True)

    class Meta:
        model = Reclamation
        fields = ['id', 'status', 'type', 'content', 'created_at', 'updated_at', 'author', 'author_username']
        read_only_fields = ['created_at', 'updated_at']  # Make these fields read-only
        extra_kwargs = {'author': {'read_only': True}}  # Author is set automatically

    def create(self, validated_data):
        # Automatically assign the author from the request user
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['author'] = request.user
        reclamation = Reclamation.objects.create(**validated_data)
        return reclamation

class UserRegistrationSerializer(serializers.ModelSerializer):
    password_confirmation = serializers.CharField(write_only=True) 
    class Meta:
        model = User
        fields = ['id','first_name', 'last_name', 'email', 'password', 'password_confirmation']
        extra_kwargs = {'password': {'write_only': True}}
    def validate(self, data):    
        if data['password'] != data.get('password_confirmation'):
            raise serializers.ValidationError("Passwords do not match")
        return data
    def create(self, validated_data):

        validated_data['username'] = validated_data['email']
        validated_data.pop('password_confirmation')

        user = User.objects.create_user(**validated_data)
        return user
    
#class ReclamationSerialzer(serializers.Serializer):