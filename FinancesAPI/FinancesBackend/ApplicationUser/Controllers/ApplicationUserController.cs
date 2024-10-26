using FinancesBackend.ApplicationUser.Requests;
using FinancesBackend.Common.Exceptions;
using FinancesBackend.Labels.Exceptions;
using FinancesBackend.Labels.Requests;
using FinancesBackend.Transaction.Exceptions;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;
using ControllerBase = FinancesBackend.Common.ControllerBase;

namespace FinancesBackend.ApplicationUser.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ApplicationUserController(IMediator mediator) : ControllerBase(mediator)
    {
        [Authorize]
        [HttpDelete]
        [SwaggerOperation("Deletes the user")]
        [SwaggerResponse(StatusCodes.Status204NoContent, "The user was deleted")]
        [SwaggerResponse(StatusCodes.Status404NotFound, "The user was not found", typeof(ProblemDetails))]
        public async Task<IActionResult> DeleteApplicationUser([FromQuery] DeleteApplicationUserRequest request)
        {
            try
            {
                await Mediator.Send(request, HttpContext.RequestAborted);

                return NoContent();
            }
            catch (UserNotFoundException exception)
            {
                return exception.ToActionResult(this);
            }
            catch (WrappedDbUpdateConcurrencyException)
            {
                return Conflict();
            }
        }
    }
}
