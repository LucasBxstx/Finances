using FinancesBackend.Services;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using FinancesBackend.Authentication.Requests;
using Microsoft.AspNetCore.Identity.Data;
using FinancesBackend.Authentication.Models;
using FinancesBackend.ApplicationUser.Models;
using FinancesBackend.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using FinancesBackend.Authentication.Requests;

namespace FinancesBackend.Authentication.Requests
{
    internal sealed class LoginRequestHandler : IRequestHandler<LoginRequest, Models.TokenResponse>
    {
        private readonly SignInManager<ApplicationUser.Models.ApplicationUser> _signInManager;
        private readonly UserManager<ApplicationUser.Models.ApplicationUser> _userManager;
        private readonly IJwtTokenService _jwtTokenService;

        public LoginRequestHandler(SignInManager<ApplicationUser.Models.ApplicationUser> signInManager, UserManager<ApplicationUser.Models.ApplicationUser> userManager, IJwtTokenService jwtTokenService)
        {
            _signInManager = signInManager;
            _userManager = userManager;
            _jwtTokenService = jwtTokenService;
        }

        public async Task<Models.TokenResponse> Handle(LoginRequest request, CancellationToken cancellationToken)
        {
            var user = await _userManager.FindByEmailAsync(request.Email);
            if (user == null) return Unauthorized(new { message = "Invalid email" });

            var result = await _signInManager.CheckPasswordSignInAsync(user, loginRequest.Password, false);
            if (!result.Succeeded) return Unauthorized(new { message = "Invalid password" });

            var token = _jwtTokenService.GenerateTokens(user);

            return Ok(new
            {
                accessToken = token.AccessToken,
                refreshToken = token.RefreshToken,
                userId = user.Id
            });
        }   
    }
}
