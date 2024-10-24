using Microsoft.AspNetCore.Mvc;
using System.Net;

namespace FinancesBackend.Common.Exceptions
{
    public static class UnauthorizedExceptionExtension
    {
        public static ActionResult<TResult> ToActionResult<TResult>(
            this UnauthorizedException exception,
            Microsoft.AspNetCore.Mvc.ControllerBase controller,
            HttpStatusCode statusCode = HttpStatusCode.Unauthorized)
        {
            return controller.Problem(statusCode: (int)statusCode, detail: exception.Message, title: exception.Title);
        }

        public static IActionResult ToActionResult(
            this UnauthorizedException exception,
            Microsoft.AspNetCore.Mvc.ControllerBase controller,
            HttpStatusCode statusCode = HttpStatusCode.Unauthorized)
        {
            return ToActionResult<object>(exception, controller, statusCode).Result!;
        }
    }
}
