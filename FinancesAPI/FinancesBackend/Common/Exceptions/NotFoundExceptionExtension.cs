using System.Net;
using Microsoft.AspNetCore.Mvc;

namespace FinancesBackend.Common.Exceptions
{
    public static class NotFoundExceptionExtension
    {
        public static ActionResult<TResult> ToActionResult<TResult>(
            this NotFoundException exception,
            Microsoft.AspNetCore.Mvc.ControllerBase controller,
            HttpStatusCode statusCode = HttpStatusCode.NotFound)
        {
            return controller.Problem(statusCode: (int)statusCode, detail: exception.Message, title: exception.Title);
        }

        public static IActionResult ToActionResult(
            this NotFoundException exception,
            Microsoft.AspNetCore.Mvc.ControllerBase controller,
            HttpStatusCode statusCode = HttpStatusCode.NotFound)
        {
            return ToActionResult<object>(exception, controller, statusCode).Result!;
        }
    }
}
