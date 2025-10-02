from django.urls import path
from .views import CreateReclamationView,ReclamationDelete, ReclamationListView, ReclamationListAllView, ReclamationDetailUpdateView
from .views import CurrentUserView, ReclamationSubmitRatingView, UserListView
from .views import AgentListCreateView, AgentDetailView, AssignedReclamationsView
urlpatterns = [
    path('reclamations/', CreateReclamationView.as_view(), name='reclamation_list_create'),  
    path('reclamations/list/', ReclamationListView.as_view(), name='list-reclamation'),
    path('reclamations/delete/<int:pk>/', ReclamationDelete.as_view(), name='reclamation_delete'),
    # Admin endpoints
    path('reclamations/all/', ReclamationListAllView.as_view(), name='list-all-reclamations'),
    path('reclamations/<int:pk>/', ReclamationDetailUpdateView.as_view(), name='reclamation-detail-update'),
    # Rating endpoint for users
    path('reclamations/<int:pk>/rating/', ReclamationSubmitRatingView.as_view(), name='reclamation-submit-rating'),
    # Return the currently authenticated user's info
    path('users/me/', CurrentUserView.as_view(), name='current-user'),
    # Admin endpoint to list all users
    path('users/all/', UserListView.as_view(), name='list-all-users'),
    # Agents management and agent-assigned reclamations
    path('agents/', AgentListCreateView.as_view(), name='agents-list-create'),
    path('agents/<int:pk>/', AgentDetailView.as_view(), name='agents-detail'),
    path('reclamations/assigned/', AssignedReclamationsView.as_view(), name='assigned-reclamations'),
]


