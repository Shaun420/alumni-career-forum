from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import User


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user data - used for responses"""
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'role', 'role_display', 'graduation_year', 'department', 
            'bio', 'is_staff', 'date_joined'
        ]
        read_only_fields = ['id', 'is_staff', 'date_joined']


class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    password2 = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )

    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'password2',
            'first_name', 'last_name', 'role', 'graduation_year',
            'department', 'bio'
        ]
        extra_kwargs = {
            'email': {'required': True},
            'first_name': {'required': False},
            'last_name': {'required': False},
            'role': {'required': False},
            'graduation_year': {'required': False},
            'department': {'required': False},
            'bio': {'required': False},
        }

    def validate(self, attrs):
        # Check passwords match
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({
                "password": "Password fields didn't match."
            })
        
        # Check if email already exists
        email = attrs.get('email')
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError({
                "email": "A user with this email already exists."
            })
        
        # Validate graduation year if provided
        graduation_year = attrs.get('graduation_year')
        if graduation_year:
            import datetime
            current_year = datetime.datetime.now().year
            if graduation_year < 1950 or graduation_year > current_year + 10:
                raise serializers.ValidationError({
                    "graduation_year": f"Graduation year must be between 1950 and {current_year + 10}."
                })
        
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    """Serializer for user login"""
    username = serializers.CharField(required=True)
    password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )

    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')

        if username and password:
            # Try to authenticate with username
            user = authenticate(username=username, password=password)
            
            # If failed, try with email
            if not user:
                try:
                    user_obj = User.objects.get(email=username)
                    user = authenticate(username=user_obj.username, password=password)
                except User.DoesNotExist:
                    pass
            
            if not user:
                raise serializers.ValidationError({
                    'error': 'Invalid username/email or password.'
                })
            
            if not user.is_active:
                raise serializers.ValidationError({
                    'error': 'User account is disabled.'
                })
            
            attrs['user'] = user
            return attrs
        else:
            raise serializers.ValidationError({
                'error': 'Must include "username" and "password".'
            })


class UpdateProfileSerializer(serializers.ModelSerializer):
    """Serializer for updating user profile"""
    
    class Meta:
        model = User
        fields = [
            'first_name', 'last_name', 'email',
            'role', 'graduation_year', 'department', 'bio'
        ]
        extra_kwargs = {
            'email': {'required': False},
        }

    def validate_email(self, value):
        user = self.context['request'].user
        if User.objects.exclude(pk=user.pk).filter(email=value).exists():
            raise serializers.ValidationError("This email is already in use.")
        return value


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for changing password"""
    old_password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )
    new_password = serializers.CharField(
        required=True,
        write_only=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    new_password2 = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )

    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password2']:
            raise serializers.ValidationError({
                "new_password": "New password fields didn't match."
            })
        return attrs

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect.")
        return value