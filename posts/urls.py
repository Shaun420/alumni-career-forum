from django.urls import path
from .views import (
    PostListCreateView,
    PostDetailView,
    PostLikeView,
    CommentListCreateView,
    CommentDetailView,
    UserCommentsView,
)

urlpatterns = [
    # Posts
    path('', PostListCreateView.as_view(), name='post-list-create'),
    path('<int:pk>/', PostDetailView.as_view(), name='post-detail'),
    path('<int:pk>/like/', PostLikeView.as_view(), name='post-like'),
    
    # Comments
    path('<int:post_id>/comments/', CommentListCreateView.as_view(), name='comment-list-create'),
    path('<int:post_id>/comments/<int:comment_id>/', CommentDetailView.as_view(), name='comment-detail'),
    
    # User's comments
    path('my-comments/', UserCommentsView.as_view(), name='user-comments'),
]