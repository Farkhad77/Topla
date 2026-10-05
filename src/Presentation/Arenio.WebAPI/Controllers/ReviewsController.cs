using Arenio.Application.Abstracts.Services;
using Arenio.Application.DTOs.ReviewDtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Arenio.Presentation.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ReviewController : ControllerBase
{
    private readonly IReviewService _reviewService;

    public ReviewController(IReviewService reviewService)
    {
        _reviewService = reviewService;
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> Create(
        ReviewCreateDto dto,
        CancellationToken cancellationToken)
    {
        var response = await _reviewService.CreateReviewAsync(dto, cancellationToken);

        return StatusCode((int)response.StatusCode, response);
    }

    [Authorize]
    [HttpPut("{reviewId:guid}")]
    public async Task<IActionResult> Update(
        Guid reviewId,
        ReviewUpdateDto dto,
        CancellationToken cancellationToken)
    {
        var response = await _reviewService.UpdateReviewAsync(
            reviewId,
            dto,
            cancellationToken);

        return StatusCode((int)response.StatusCode, response);
    }

    [Authorize(Roles = "Admin,Moderator")]
    [HttpDelete("{reviewId:guid}")]
    public async Task<IActionResult> Delete(
        Guid reviewId,
        CancellationToken cancellationToken)
    {
        var response = await _reviewService.DeleteReviewAsync(
            reviewId,
            cancellationToken);

        return StatusCode((int)response.StatusCode, response);
    }

    [Authorize]
    [HttpDelete("my-review/{reviewId:guid}")]
    public async Task<IActionResult> DeleteMyReview(
        Guid reviewId,
        CancellationToken cancellationToken)
    {
        var response = await _reviewService.DeleteMyReviewAsync(
            reviewId,
            cancellationToken);

        return StatusCode((int)response.StatusCode, response);
    }

    [AllowAnonymous]
    [HttpGet("stadium/{stadiumId:guid}")]
    public async Task<IActionResult> GetAllByStadiumId(
        Guid stadiumId,
        CancellationToken cancellationToken)
    {
        var response = await _reviewService.GetAllByStadiumIdAsync(
            stadiumId,
            cancellationToken);

        return StatusCode((int)response.StatusCode, response);
    }

    [Authorize(Roles = "Admin,Moderator")]
    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetByUserId(
        string userId,
        CancellationToken cancellationToken)
    {
        var response = await _reviewService.GetByUserIdAsync(
            userId,
            cancellationToken);

        return StatusCode((int)response.StatusCode, response);
    }
}
