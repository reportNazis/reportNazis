from django.urls import path
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.conf import settings
from .models import InviteCode
import logging
import requests

logger = logging.getLogger(__name__)


def get_zitadel_token():
    """Read the service account PAT from file."""
    try:
        with open(settings.ZITADEL_SERVICE_TOKEN_PATH, 'r') as f:
            return f.read().strip()
    except FileNotFoundError:
        logger.error(f"Zitadel PAT file not found: {settings.ZITADEL_SERVICE_TOKEN_PATH}")
        return None


class LoginView(APIView):
    """
    Proxy login endpoint that authenticates users via Zitadel Session API v2.
    """

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return Response(
                {"error": "Username and password are required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        token = get_zitadel_token()
        if not token:
            return Response(
                {"error": "Authentication service unavailable"},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "Host": "localhost"  # Required: Zitadel uses Host header for instance lookup
        }

        zitadel_url = settings.ZITADEL_API_URL

        # Step 1: Create session with user check
        try:
            create_resp = requests.post(
                f"{zitadel_url}/v2/sessions",
                headers=headers,
                json={
                    "checks": {
                        "user": {
                            "loginName": username
                        }
                    }
                },
                timeout=10
            )

            if create_resp.status_code != 201:
                logger.warning(f"Zitadel session creation failed: {create_resp.text}")
                return Response(
                    {"error": "Invalid credentials"},
                    status=status.HTTP_401_UNAUTHORIZED
                )

            session_data = create_resp.json()
            session_id = session_data.get("sessionId")
            session_token = session_data.get("sessionToken")

            if not session_id or not session_token:
                logger.error(f"Missing session data from Zitadel: {session_data}")
                return Response(
                    {"error": "Authentication failed"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

            # Step 2: Update session with password check
            password_resp = requests.patch(
                f"{zitadel_url}/v2/sessions/{session_id}",
                headers=headers,
                json={
                    "checks": {
                        "password": {
                            "password": password
                        }
                    },
                    "sessionToken": session_token
                },
                timeout=10
            )

            if password_resp.status_code != 200:
                logger.warning(f"Zitadel password check failed: {password_resp.text}")
                return Response(
                    {"error": "Invalid credentials"},
                    status=status.HTTP_401_UNAUTHORIZED
                )

            # Success! Return session info to the frontend
            final_data = password_resp.json()
            return Response({
                "sessionId": session_id,
                "sessionToken": final_data.get("sessionToken", session_token),
                "message": "Login successful"
            }, status=status.HTTP_200_OK)

        except requests.exceptions.RequestException as e:
            logger.error(f"Zitadel request failed: {e}")
            return Response(
                {"error": "Authentication service unavailable"},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )


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
        logger.info(f"Mocking user creation for {email} with code {code_str}")

        # Invalidate code
        invite.is_active = False
        invite.save()

        return Response({"status": "redeemed", "user_email": email}, status=status.HTTP_200_OK)


urlpatterns = [
    path('invites/', CreateInviteView.as_view()),
    path('invites/redeem/', RedeemInviteView.as_view()),
    path('login/', LoginView.as_view()),
]


