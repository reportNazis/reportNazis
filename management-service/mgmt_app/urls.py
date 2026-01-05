from django.urls import path
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import InviteCode
import logging

logger = logging.getLogger(__name__)

class CreateInviteView(APIView):
    def post(self, request):
        invite = InviteCode.objects.create()
        return Response({"code": str(invite.code)}, status=status.HTTP_201_CREATED)

class RedeemInviteView(APIView):
    def post(self, request):
        code_str = request.data.get('code')
        email = request.data.get('email')
        
        invite = get_object_or_404(InviteCode, code=code_str)
        
        if not invite.is_valid():
            return Response({"error": "Code invalid or expired"}, status=status.HTTP_400_BAD_REQUEST)
        
        # MOCK Zitadel User Creation
        # In real life: requests.post(f"{settings.ZITADEL_ISSUER}/api/v1/users", ...)
        logger.info(f"Mocking user creation for {email} with code {code_str}")
        
        # Invalidate code
        invite.is_active = False
        invite.save()
        
        return Response({"status": "redeemed", "user_email": email}, status=status.HTTP_200_OK)

urlpatterns = [
    path('', CreateInviteView.as_view()),
    path('redeem/', RedeemInviteView.as_view()),
]
