using Microsoft.AspNetCore.Mvc;
using MediatR;

namespace FinancesBackend.Common
{
    [ApiController]
    public abstract class ControllerBase(IMediator mediator): Microsoft.AspNetCore.Mvc.ControllerBase
    {
        protected IMediator Mediator { get; } = mediator;
    }
}
