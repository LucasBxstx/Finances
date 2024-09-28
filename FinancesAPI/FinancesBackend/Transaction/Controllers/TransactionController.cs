using FinancesBackend.Common.Exceptions;
using FinancesBackend.Transaction.Exceptions;
using FinancesBackend.Transaction.Models;
using FinancesBackend.Transaction.Queries;
using FinancesBackend.Transaction.Requests;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;
using ControllerBase = FinancesBackend.Common.ControllerBase;

namespace FinancesBackend.Transaction.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    //[Authorize]
    public class TransactionController(IMediator mediator) : ControllerBase(mediator)
    {
        [Authorize]
        [HttpGet]
        [SwaggerOperation("Gets the desired transaction")]
        [SwaggerResponse(StatusCodes.Status200OK, "The transaction data", typeof(Models.Transaction))]
        [SwaggerResponse(StatusCodes.Status404NotFound, "The transaction was not found", typeof(ProblemDetails))]
        public async Task<ActionResult<Models.Transaction>> GetTransaction([FromQuery] int id)
        {
            try
            {
                var result = await Mediator.Send(new GetTransactionQuery { Id = id }, HttpContext.RequestAborted);

                return Ok(result);
            }
            catch (TransactionNotFoundException exception)
            {
                return exception.ToActionResult<Models.Transaction>(this);
            }
        }

        [Authorize]
        [HttpGet("all")]
        [SwaggerOperation("Gets all transactions for the user")]
        [SwaggerResponse(StatusCodes.Status200OK, "The transactions", typeof(TransactionView))]
        [SwaggerResponse(StatusCodes.Status404NotFound, "The user was not found", typeof(ProblemDetails))]
        public async Task<ActionResult<TransactionView>> GetAllTransactions([FromQuery] GetTransactionsQuery query)
        {
            try
            {
                var result = await Mediator.Send(query, HttpContext.RequestAborted);

                return Ok(result);
            }
            catch (UserNotFoundException exception)
            {
                return exception.ToActionResult<TransactionView>(this);
            }
            
        }

        [Authorize]
        [HttpPut]
        [SwaggerOperation("Creates or updates the transaction")]
        [SwaggerResponse(StatusCodes.Status200OK, "The created/updated Transaction", typeof(Models.Transaction))]
        [SwaggerResponse(StatusCodes.Status404NotFound, "The user could not be found", typeof(ProblemDetails))]
        [SwaggerResponse(StatusCodes.Status400BadRequest, "The row version was missing which most of the times means that the transaction was already created and now needs to be updated. Please request the updated version", typeof(ProblemDetails))]
        [SwaggerResponse(StatusCodes.Status409Conflict, "The transaction was already updated. Please request the updated version", typeof(ProblemDetails))]
        public async Task<ActionResult<Models.Transaction>> CreateOrUpdateTransaction([FromBody] CreateOrUpdateTransactionRequest request)
        {
            try
            {
                var result = await Mediator.Send(request, HttpContext.RequestAborted);

                return Ok(result);
            }
            catch (UserNotFoundException exception)
            {
                return exception.ToActionResult<Models.Transaction>(this);
            }
            catch (RowVersionMissingException exception)
            {
                return exception.ToActionResult<Models.Transaction>(this);
            }
            catch ( WrappedDbUpdateConcurrencyException)
            {
                return Conflict();
            }
        }

        [Authorize]
        [HttpDelete]
        [SwaggerOperation("Deletes the transaction")]
        [SwaggerResponse(StatusCodes.Status204NoContent, "The transaction was deleted")]
        [SwaggerResponse(StatusCodes.Status404NotFound, "The transaction was not found", typeof(ProblemDetails))]
        public async Task<IActionResult> DeleteTransaction([FromQuery] DeleteTransactionRequest request)
        {
            try
            {
                await Mediator.Send(request, HttpContext.RequestAborted);

                return NoContent();
            }
            catch (TransactionNotFoundException exception)
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
