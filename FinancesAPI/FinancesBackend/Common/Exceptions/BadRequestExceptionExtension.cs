using Microsoft.AspNetCore.Mvc;
using System.Net;

namespace FinancesBackend.Common.Exceptions
{
    public static class BadRequestExceptionExtension
    {
        public static ActionResult<TResult> ToActionResult<TResult>(
            this BadRequestException exception,
            Microsoft.AspNetCore.Mvc.ControllerBase controller,
            HttpStatusCode statusCode = HttpStatusCode.BadRequest)
        {
            return controller.Problem(statusCode: (int)statusCode, detail: exception.Message, title: exception.Title);
        }

        public static IActionResult ToActionResult(
            this BadRequestException exception,
            Microsoft.AspNetCore.Mvc.ControllerBase controller,
            HttpStatusCode statusCode = HttpStatusCode.BadRequest)
        {
            return ToActionResult<object>(exception, controller, statusCode).Result!;
        }
    }
}
