class AuthenticationExemptMiddleware:
    """
    Middleware to exempt authentication for specific paths
    """
    def __init__(self, get_response):
        self.get_response = get_response
        # Authentication-exempt paths
        self.exempt_urls = [
            '/core/login/',
            '/core/register/',
            '/core/check-username/',
            '/core/check-email/',
            '/core/forgot-password/'
        ]

    def __call__(self, request):
        # Bypass authentication for exempt paths
        if any(request.path.startswith(url) for url in self.exempt_urls):
            request.META['HTTP_AUTHORIZATION'] = ''
        
        response = self.get_response(request)
        return response
