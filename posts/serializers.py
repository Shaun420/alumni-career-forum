from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Post, Comment


class CommentSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='user.username', read_only=True)
    is_owner = serializers.SerializerMethodField()
    can_delete = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = [
            'id', 'post', 'user', 'author_name', 'author_role', 
            'content', 'created_at', 'updated_at', 'is_edited',
            'is_owner', 'can_delete'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at', 'is_edited']

    def get_is_owner(self, obj):
        """Check if current user is the comment owner"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.user == request.user
        return False

    def get_can_delete(self, obj):
        """Check if current user can delete the comment (owner or admin)"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.user == request.user or request.user.is_staff
        return False


class CommentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating comments"""
    
    class Meta:
        model = Comment
        fields = ['post', 'author_role', 'content']

    def create(self, validated_data):
        # User is automatically set from the request
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class CommentUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating comments"""
    
    class Meta:
        model = Comment
        fields = ['author_role', 'content']

    def update(self, instance, validated_data):
        instance.is_edited = True
        return super().update(instance, validated_data)


class PostSerializer(serializers.ModelSerializer):
    comments = CommentSerializer(many=True, read_only=True)
    comments_count = serializers.SerializerMethodField()
    skills_list = serializers.SerializerMethodField()
    category_display = serializers.CharField(source='get_category_display', read_only=True)

    class Meta:
        model = Post
        fields = [
            'id', 'name', 'email', 'role', 'category', 'category_display',
            'company', 'experience', 'skills', 'skills_list',
            'graduation_year', 'linkedin_url', 'likes',
            'created_at', 'updated_at', 'comments', 'comments_count'
        ]
        read_only_fields = ['created_at', 'updated_at', 'likes']

    def get_comments_count(self, obj):
        return obj.comments.count()

    def get_skills_list(self, obj):
        return obj.get_skills_list()


class PostCreateSerializer(serializers.ModelSerializer):
    """Simplified serializer for creating posts"""
    
    class Meta:
        model = Post
        fields = [
            'name', 'email', 'role', 'category', 'company',
            'experience', 'skills', 'graduation_year', 'linkedin_url'
        ]