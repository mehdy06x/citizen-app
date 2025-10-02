from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Reclamation
from .models import Agent

class UserSerializer(serializers.ModelSerializer):
    # include phone pulled from a related Profile (if present)
    phone_number = serializers.CharField(source='profile.phone_number', allow_null=True, read_only=True)
    # indicate whether this user has an Agent profile
    is_agent = serializers.SerializerMethodField()

    class Meta:
        model = User
        # expose a few non-sensitive fields so frontend can detect role and display email
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'is_staff',
            'is_superuser',
            'password',
            'phone_number',
            'is_agent',
        ]
        extra_kwargs = {'password': {'write_only': True}}  # Ensure password is write-only

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

    def get_is_agent(self, obj):
        try:
            return hasattr(obj, 'agent_profile')
        except Exception:
            return False
    

class ReclamationSerializer(serializers.ModelSerializer):
    # Expose the author's username for frontend display
    author_username = serializers.CharField(source='author.username', read_only=True)
    photo = serializers.ImageField(required=False, allow_null=True)
    location = serializers.CharField(required=False, allow_blank=True)
    custom_type = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = Reclamation
        fields = [
            'id', 'status', 'type', 'custom_type', 'content', 'photo', 'location',
            'created_at', 'updated_at', 'author', 'author_username', 'assigned_to',
            'assigned_agent_username', 'assigned_agent_phone', 'assigned_agent_email',
            'rating', 'rating_comment', 'rating_submitted_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'rating_submitted_at']  # Make these fields read-only
        extra_kwargs = {'author': {'read_only': True}}  # Author is set automatically

    # Allow frontend to receive assigned agent data easily
    assigned_agent_username = serializers.CharField(source='assigned_to.username', read_only=True)
    assigned_agent_phone = serializers.CharField(source='assigned_to.agent_profile.phone_number', read_only=True, allow_null=True)
    assigned_agent_email = serializers.CharField(source='assigned_to.email', read_only=True, allow_null=True)

    def create(self, validated_data):
        # Automatically assign the author from the request user
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['author'] = request.user
        reclamation = Reclamation.objects.create(**validated_data)
        return reclamation
    
    def to_representation(self, instance):
        """Return serialized data but hide feedback fields unless the
        requesting user is the reclamation author.

        This ensures agents (or other users) cannot see rating/rating_comment
        until the author submits them and views their own reclamation.
        """
        data = super().to_representation(instance)
        request = self.context.get('request')
        try:
            requesting_user = getattr(request, 'user', None)
        except Exception:
            requesting_user = None

        # Show rating fields to the author and to staff/superusers; hide from others
        can_see = False
        try:
            if requesting_user and (instance.author == requesting_user or requesting_user.is_staff or requesting_user.is_superuser):
                can_see = True
        except Exception:
            can_see = False

        if not can_see:
            for f in ('rating', 'rating_comment', 'rating_submitted_at'):
                if f in data:
                    data.pop(f, None)
        return data

class UserRegistrationSerializer(serializers.ModelSerializer):
    password_confirmation = serializers.CharField(write_only=True)
    # Accept phone_number on registration (write-only). This is not a field on User model
    # so declare it here and persist it to the related Profile in create().
    phone_number = serializers.CharField(write_only=True, required=False, allow_blank=True)
    class Meta:
        model = User
        # accept phone on registration and persist it into the user's Profile
        fields = ['id','first_name', 'last_name', 'email', 'password', 'password_confirmation', 'phone_number']
        extra_kwargs = {'password': {'write_only': True}}
    def validate(self, data):
        # Use .get to avoid KeyError if a field is missing and provide a clear validation error
        pwd = data.get('password')
        pwd_conf = data.get('password_confirmation')
        if not pwd or not pwd_conf:
            raise serializers.ValidationError({'password': 'Password and password_confirmation are required.'})
        if pwd != pwd_conf:
            raise serializers.ValidationError({'password_confirmation': 'Passwords do not match.'})
        return data
    def create(self, validated_data):

        validated_data['username'] = validated_data['email']
        # Pop out our extra fields
        validated_data.pop('password_confirmation', None)
        phone = validated_data.pop('phone_number', None)

        user = User.objects.create_user(**validated_data)

        # Save phone into the related Profile (create profile if missing)
        try:
            profile = user.profile
        except Exception:
            from .models import Profile
            profile, _ = Profile.objects.get_or_create(user=user)
        if phone:
            profile.phone_number = phone
            profile.save()

        return user


class AgentSerializer(serializers.ModelSerializer):
    # Nested user creation/update is simplified: admin provides user id when creating agent
    user = UserSerializer()

    class Meta:
        model = Agent
        fields = ['id', 'user', 'cin', 'phone_number', 'cin_image']
        read_only_fields = ['id']

    def create(self, validated_data):
        user_data = validated_data.pop('user', None)
        if user_data is None:
            raise serializers.ValidationError({'user': 'User data is required for agent creation'})
        username = user_data.get('username') or user_data.get('email')
        if not username:
            raise serializers.ValidationError({'user': 'username or email is required'})
        password = user_data.get('password')
        if not password:
            raise serializers.ValidationError({'user': 'password is required for agent creation'})
        # Create the underlying User
        user = User.objects.create_user(username=username, email=user_data.get('email', ''), password=password, first_name=user_data.get('first_name', ''), last_name=user_data.get('last_name', ''))
        agent = Agent.objects.create(user=user, **validated_data)
        return agent
    
#class ReclamationSerialzer(serializers.Serializer):