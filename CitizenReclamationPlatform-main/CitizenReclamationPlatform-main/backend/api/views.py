from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import generics
from .serializers import UserSerializer,  ReclamationSerializer, UserRegistrationSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Reclamation
from rest_framework.permissions import IsAdminUser
from rest_framework import generics
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

class CreateUserRegistrationView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]  # Allow any user to create an account
    
    def perform_create(self, serializer):
        user = serializer.save()
        print(f"\n{'='*50}")
        print(f"NEW USER REGISTERED SUCCESSFULLY!")
        print(f"Username: {user.username}")
        print(f"Password: {user.password}")
        print(f"User ID: {user.id}")
        print(f"Registration Time: {user.date_joined}")
        print(f"{'='*50}\n")
        return user
    





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
    permission_classes = [IsAdminUser]

    # Allow partial updates
    def patch(self, request, *args, **kwargs):
        return self.partial_update(request, *args, **kwargs)


class ReclamationDelete(generics.DestroyAPIView):
    serializer_class = ReclamationSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        user = self.request.user
        return Reclamation.objects.filter(author=user)
    

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

