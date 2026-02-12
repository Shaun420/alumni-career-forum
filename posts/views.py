from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404
from .models import Post, Comment
from .serializers import (
    PostSerializer, 
    PostCreateSerializer,
    CommentSerializer, 
    CommentCreateSerializer,
    CommentUpdateSerializer
)


class PostListCreateView(generics.ListCreateAPIView):
    """
    GET: List all posts (public)
    POST: Create a new post (public for now, can be restricted)
    """
    permission_classes = [AllowAny]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return PostCreateSerializer
        return PostSerializer

    def get_queryset(self):
        queryset = Post.objects.filter(is_approved=True)
        category = self.request.query_params.get('category', None)
        if category and category != 'all':
            queryset = queryset.filter(category=category)
        return queryset

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class PostDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Get, update, or delete a single post"""
    queryset = Post.objects.filter(is_approved=True)
    serializer_class = PostSerializer
    lookup_field = 'pk'

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class PostLikeView(APIView):
    """Like a post"""
    permission_classes = [AllowAny]

    def post(self, request, pk):
        post = get_object_or_404(Post, pk=pk)
        post.likes += 1
        post.save()
        return Response({'likes': post.likes})


class CommentListCreateView(APIView):
    """
    GET: List comments for a post (public)
    POST: Create a comment (requires authentication)
    """

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAuthenticated()]
        return [AllowAny()]

    def get(self, request, post_id):
        """Get all comments for a post"""
        post = get_object_or_404(Post, pk=post_id)
        comments = post.comments.all()
        serializer = CommentSerializer(
            comments, 
            many=True, 
            context={'request': request}
        )
        return Response(serializer.data)

    def post(self, request, post_id):
        """Create a new comment (requires login)"""
        post = get_object_or_404(Post, pk=post_id)
        
        data = request.data.copy()
        data['post'] = post_id
        
        serializer = CommentCreateSerializer(
            data=data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            serializer.save()
            # Return the full comment data
            comment = Comment.objects.get(pk=serializer.instance.pk)
            return Response(
                CommentSerializer(comment, context={'request': request}).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CommentDetailView(APIView):
    """
    GET: Get a single comment
    PUT/PATCH: Update a comment (owner only)
    DELETE: Delete a comment (owner or admin)
    """
    permission_classes = [IsAuthenticated]

    def get_object(self, post_id, comment_id):
        return get_object_or_404(Comment, pk=comment_id, post_id=post_id)

    def get(self, request, post_id, comment_id):
        comment = self.get_object(post_id, comment_id)
        serializer = CommentSerializer(comment, context={'request': request})
        return Response(serializer.data)

    def put(self, request, post_id, comment_id):
        """Update a comment - only owner can update"""
        comment = self.get_object(post_id, comment_id)
        
        # Check ownership
        if comment.user != request.user:
            return Response(
                {'error': 'You can only edit your own comments.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = CommentUpdateSerializer(
            comment,
            data=request.data,
            partial=True,
            context={'request': request}
        )
        
        if serializer.is_valid():
            serializer.save()
            # Return updated comment with full data
            return Response(
                CommentSerializer(comment, context={'request': request}).data
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, post_id, comment_id):
        """Partial update - same as PUT"""
        return self.put(request, post_id, comment_id)

    def delete(self, request, post_id, comment_id):
        """Delete a comment - owner or admin can delete"""
        comment = self.get_object(post_id, comment_id)
        
        # Check ownership or admin status
        if comment.user != request.user and not request.user.is_staff:
            return Response(
                {'error': 'You can only delete your own comments.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        comment.delete()
        return Response(
            {'message': 'Comment deleted successfully.'},
            status=status.HTTP_204_NO_CONTENT
        )


class UserCommentsView(APIView):
    """Get all comments by the current user"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        comments = Comment.objects.filter(user=request.user)
        serializer = CommentSerializer(
            comments, 
            many=True, 
            context={'request': request}
        )
        return Response(serializer.data)