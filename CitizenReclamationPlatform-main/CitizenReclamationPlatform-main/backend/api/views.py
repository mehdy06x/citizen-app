from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import generics
from rest_framework import serializers as drf_serializers
from .serializers import UserSerializer,  ReclamationSerializer, UserRegistrationSerializer
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Reclamation
from rest_framework.permissions import IsAdminUser
from rest_framework import generics
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from .serializers import AgentSerializer
from .models import Agent
# Create your views here.
#class CreateUserView(generics.CreateAPIView):
#    queryset = User.objects.all()
#   serializer_class = UserSerializer
#  permission_classes = [AllowAny]


class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]  # Allow any user to create an account
    
    def perform_create(self, serializer):
        # Save the user
        user = serializer.save()
        
        # Get the password from the request data
      
        password = self.request.data.get('password', '')
        # Print the registration details to terminal
        print(f"\n{'='*50}")
        print(f"NEW USER REGISTERED SUCCESSFULLY!")
        print(f"Username: {user.username}")
        print(f"Password: {password}")
        print(f"User ID: {user.id}")
        print(f"Registration Time: {user.date_joined}")
        print(f"{'='*50}\n")
        
        return user


# Custom token serializer/view to allow login by email as well as username.
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Extend TokenObtainPairSerializer to accept 'email' in place of 'username'.

    If the incoming payload contains an 'email' field but not 'username',
    we look up the corresponding user and set the username field so the
    base serializer's authenticate flow works unchanged.
    """
    # allow clients to POST an 'email' field in addition to username/password
    email = drf_serializers.CharField(write_only=True, required=False)
    def validate(self, attrs):
        # attrs normally contains 'username' and 'password'. If username is
        # missing but the client provided 'email', try to resolve it.
        username_field = self.username_field  # usually 'username'
        if not attrs.get(username_field) and attrs.get('email'):
            email = attrs.get('email')
            try:
                user = User.objects.get(email=email)
                # Set the username attr to the user's username, so the
                # parent class can authenticate the user normally.
                attrs[username_field] = user.get_username()
            except User.DoesNotExist:
                # leave attrs untouched; the parent will raise authentication error
                pass
        return super().validate(attrs)

    def __init__(self, *args, **kwargs):
        # Make the username field optional so the client may provide only 'email'
        super().__init__(*args, **kwargs)
        username_field = getattr(self, 'username_field', 'username')
        if username_field in self.fields:
            self.fields[username_field].required = False


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class CreateUserRegistrationView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]  # Allow any user to create an account
    def create(self, request, *args, **kwargs):
        # Override to capture and return server-side errors as JSON for easier debugging
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            # Return structured serializer errors (400) so frontend can display fields
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        try:
            user = serializer.save()
            # Log success details (avoid printing raw password in production)
            print(f"\n{'='*50}")
            print(f"NEW USER REGISTERED SUCCESSFULLY!")
            print(f"Username: {user.username}")
            print(f"User ID: {user.id}")
            print(f"Registration Time: {user.date_joined}")
            print(f"{'='*50}\n")
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        except Exception as exc:
            # Unexpected server error: print traceback and return 500
            import traceback
            traceback.print_exc()
            return Response({'detail': 'Internal server error during registration.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    





class CreateReclamationView(generics.CreateAPIView):
    queryset = Reclamation.objects.all()
    serializer_class = ReclamationSerializer
    permission_classes = [IsAuthenticated]  # Allow any user to create an account
    
    def perform_create(self, serializer):
        if serializer.is_valid():
            reclamation = serializer.save(author=self.request.user)
            print(f"\n{'='*50}")
            print(f"NEW USER REGISTERED SUCCESSFULLY!")
            print(f"author: {reclamation.author.username}")
            print(f"reclamation type: {reclamation.type}")
            print(f"Reclamation status: {reclamation.status}")
            print(f"Reclamation Time: {reclamation.created_at}")
            print(f"{'='*50}\n")

        else:
            print(serializer.errors)
        
class ReclamationListView(generics.ListAPIView):
    serializer_class = ReclamationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Reclamation.objects.filter(author=user).order_by('-created_at')  # Order by creation time, most recent first


class ReclamationListAllView(generics.ListAPIView):
    """Admin-only view that returns all reclamations (for admin dashboard)"""
    serializer_class = ReclamationSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        return Reclamation.objects.all().order_by('-created_at')


class ReclamationDetailUpdateView(generics.RetrieveUpdateAPIView):
    """Retrieve or update a reclamation. Admins can change status."""
    queryset = Reclamation.objects.all()
    serializer_class = ReclamationSerializer
    # Admins can update any field. Agents (non-admin users) can only update the status of reclamations assigned to them.
    def get_permissions(self):
        # We allow authenticated users but will perform object-level checks in patch
        return [IsAuthenticated()]

    def patch(self, request, *args, **kwargs):
        reclamation = self.get_object()
        user = request.user

        # If user is admin/staff/superuser: allow partial update as before
        if user.is_staff or user.is_superuser:
            return self.partial_update(request, *args, **kwargs)

        # If user is the agent assigned to this reclamation: allow only status updates
        is_agent = False
        try:
            is_agent = hasattr(user, 'agent_profile')
        except Exception:
            is_agent = False

        if is_agent and reclamation.assigned_to and reclamation.assigned_to == user:
            # Limit updates to status field only
            allowed_fields = {'status'}
            update_data = {k: v for k, v in request.data.items() if k in allowed_fields}
            if not update_data:
                return Response({'detail': 'Agents can only update the status field.'}, status=status.HTTP_403_FORBIDDEN)
            # Perform partial update with restricted data
            serializer = self.get_serializer(reclamation, data=update_data, partial=True)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            return Response(serializer.data)

        # Otherwise forbid
        return Response({'detail': 'Not authorized to update this reclamation.'}, status=status.HTTP_403_FORBIDDEN)


class ReclamationDelete(generics.DestroyAPIView):
    serializer_class = ReclamationSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        user = self.request.user
        # Allow admins (staff/superuser) to delete any reclamation.
        if user.is_staff or user.is_superuser:
            return Reclamation.objects.all()
        # Regular users can only delete their own reclamations
        return Reclamation.objects.filter(author=user)


class CurrentUserView(generics.RetrieveAPIView):
    """Return the current authenticated user's basic info."""
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class UserListView(generics.ListAPIView):
    """Admin-only view that returns all users."""
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]
    queryset = User.objects.all().order_by('-date_joined')


class AgentListCreateView(generics.ListCreateAPIView):
    """Admin-only view to list and create agents."""
    serializer_class = AgentSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        return Agent.objects.all().order_by('-id')


class AgentDetailView(generics.RetrieveDestroyAPIView):
    """Retrieve or delete an Agent. Admin-only."""
    queryset = Agent.objects.all()
    serializer_class = AgentSerializer
    permission_classes = [IsAdminUser]


class AssignedReclamationsView(generics.ListAPIView):
    """Return reclamations assigned to the current agent user."""
    serializer_class = ReclamationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Only agent users can access this endpoint
        try:
            if not hasattr(user, 'agent_profile'):
                return Reclamation.objects.none()
        except Exception:
            return Reclamation.objects.none()
        return Reclamation.objects.filter(assigned_to=user).order_by('-created_at')


class ReclamationSubmitRatingView(generics.UpdateAPIView):
    """Allow reclamation author to submit rating and comment when status is resolved."""
    queryset = Reclamation.objects.all()
    serializer_class = ReclamationSerializer
    permission_classes = [IsAuthenticated]
    
    def patch(self, request, *args, **kwargs):
        reclamation = self.get_object()
        
        # Only the author can rate their own reclamation
        if reclamation.author != request.user:
            return Response({'error': 'Only the reclamation author can submit a rating'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        # Check if reclamation is resolved
        resolved_statuses = ['solved', 'resolue', 'résolue', 'resolved']
        current_status = (reclamation.status or '').lower()
        if not any(resolved_status in current_status for resolved_status in resolved_statuses):
            return Response({'error': 'Can only rate resolved reclamations'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Validate rating value
        rating = request.data.get('rating')
        if not rating or not isinstance(rating, int) or rating < 1 or rating > 5:
            return Response({'error': 'Rating must be between 1 and 5'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Update rating fields
        reclamation.rating = rating
        reclamation.rating_comment = request.data.get('rating_comment', '')
        reclamation.rating_submitted_at = timezone.now()
        reclamation.save()
        
        serializer = self.get_serializer(reclamation)
        return Response(serializer.data)
    

#class NoteListCreate(generics.ListCreateAPIView):
#    serializer_class = NoteSerializer
 #   permission_classes = [IsAuthenticated]  # Only authenticated users can access this view

 #  def get_queryset(self):
   #   user = self.request.user
    #    return Note.objects.filter(author=user)
    
    #def perform_create(self, serializer):
     #   if serializer.is_valid():
      #      serializer.save(author=self.request.user)
       # else:
        #    print(serializer.errors)

#class NoteDelete(generics.DestroyAPIView):
    
 #   serializer_class = NoteSerializer
  #  permission_classes = [IsAuthenticated]  # Only authenticated users can delete notes

   # def get_queryset(self):
    #    user = self.request.user
     #   return Note.objects.filter(author=user)