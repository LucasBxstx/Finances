using FinancesBackend.Common.Exceptions;
using FinancesBackend.Labels.Exceptions;
using FinancesBackend.Labels.Queries;
using FinancesBackend.Labels.Requests;
using FinancesBackend.Transaction.Exceptions;
using FinancesBackend.Transaction.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;
using ControllerBase = FinancesBackend.Common.ControllerBase;

namespace FinancesBackend.Labels.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    //[Authorize]

    public class LabelController(IMediator mediator) : ControllerBase(mediator)
    {
        [HttpGet]
        [SwaggerOperation("Gets the desired label")]
        [SwaggerResponse(StatusCodes.Status200OK, "The label data", typeof(Models.Label))]
        [SwaggerResponse(StatusCodes.Status404NotFound, "The label was not found", typeof(ProblemDetails))]
        public async Task<ActionResult<Models.Label>> GetLabel([FromQuery] GetLabelQuery query)
        {
            try
            {
                var result = await Mediator.Send(query, HttpContext.RequestAborted);

                return Ok(result);
            }
            catch (LabelNotFoundException exception)
            {
                return exception.ToActionResult<Models.Label>(this);
            }
        }

        [HttpGet("all")]
        [SwaggerOperation("Gets all Labels for the user")]
        [SwaggerResponse(StatusCodes.Status200OK, "The labels", typeof(List<Models.Label>))]
        [SwaggerResponse(StatusCodes.Status404NotFound, "The user was not found", typeof(ProblemDetails))]

        public async Task<ActionResult<List<Models.Label>>> GetAllLabels([FromQuery] GetLabelsQuery query)
        {
            try
            {
                var result = await Mediator.Send(query, HttpContext.RequestAborted);

                return Ok(result);
            }
            catch (UserNotFoundException exception)
            {
                return exception.ToActionResult<List<Models.Label>>(this);
            }
        }

        [HttpPut]
        [SwaggerOperation("Creates or updates the label")]
        [SwaggerResponse(StatusCodes.Status200OK, "The created/updated Label", typeof(Models.Label))]
        [SwaggerResponse(StatusCodes.Status404NotFound, "The user could not be found", typeof(ProblemDetails))]
        [SwaggerResponse(StatusCodes.Status400BadRequest, "The row version was missing which most of the times means that the label was already created and now needs to be updated. Please request the updated version", typeof(ProblemDetails))]
        [SwaggerResponse(StatusCodes.Status409Conflict, "The label was already updated. Please request the updated version", typeof(ProblemDetails))]
        public async Task<ActionResult<Models.Label>> CreateOrUpdateLabel([FromBody] CreateOrUpdateLabelRequest request)
        {
            try
            {
                var result = await Mediator.Send(request, HttpContext.RequestAborted);

                return Ok(result);
            }
            catch (UserNotFoundException exception)
            {
                return exception.ToActionResult<Models.Label>(this);
            }
            catch (RowVersionMissingException exception)
            {
                return exception.ToActionResult<Models.Label>(this);
            }
            catch (WrappedDbUpdateConcurrencyException)
            {
                return Conflict();
            }
        }
    }
}
