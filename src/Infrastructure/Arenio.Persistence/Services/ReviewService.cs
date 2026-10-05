using Arenio.Application.Abstracts.Repositories;
using Arenio.Application.Abstracts.Services;
using Arenio.Application.DTOs.ReviewDtos;
using Arenio.Application.Settings;
using Arenio.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Net;
using System.Text;
using System.Threading.Tasks;

namespace Arenio.Persistence.Services
{
    public  class ReviewService : IReviewService
    {
        private readonly IReviewRepository _reviewRepository;
        private readonly IStadiumRepository _stadiumRepository;
        private readonly ICurrentUserService _currentUser;

        public ReviewService(
            IReviewRepository reviewRepository,
            IStadiumRepository stadiumRepository,
            ICurrentUserService currentUser)
        {
            _reviewRepository = reviewRepository;
            _stadiumRepository = stadiumRepository;
            _currentUser = currentUser;
        }
        public async Task<BaseResponse<string?>> CreateReviewAsync(
    ReviewCreateDto dto,
    CancellationToken cancellationToken)
        {
            if (dto.Rating < 1 || dto.Rating > 5)
            {
                return new BaseResponse<string?>(
                    "Rating must be between 1 and 5.",
                    HttpStatusCode.BadRequest);
            }

            var stadium = await _stadiumRepository.GetByIdAsync(dto.StadiumId);

            if (stadium is null)
            {
                return new BaseResponse<string?>(
                    "Stadium not found.",
                    HttpStatusCode.NotFound);
            }

            var hasReview = await _reviewRepository
                .GetByFiltered(x =>
                    x.StadiumId == dto.StadiumId &&
                    x.UserId == _currentUser.UserId)
                .AnyAsync(cancellationToken);

            if (hasReview)
            {
                return new BaseResponse<string?>(
                    "You have already reviewed this stadium.",
                    HttpStatusCode.BadRequest);
            }

            var review = new Review
            {
                StadiumId = dto.StadiumId,
                Rating = dto.Rating,
                Comment = dto.Comment,
                UserId = _currentUser.UserId
            };

            await _reviewRepository.AddAsync(review);

            await UpdateStadiumRatingAsync(dto.StadiumId, cancellationToken);

            await _reviewRepository.SaveChangeAsync();

            return new BaseResponse<string?>(
                null,
                "Review created successfully.",
                HttpStatusCode.Created);
        }
      
        public async Task<BaseResponse<string?>> UpdateReviewAsync(
    Guid reviewId,
    ReviewUpdateDto dto,
    CancellationToken cancellationToken)
        {
            if (dto.Rating < 1 || dto.Rating > 5)
            {
                return new BaseResponse<string?>(
                    "Rating must be between 1 and 5.",
                    HttpStatusCode.BadRequest);
            }

            var review = await _reviewRepository.GetByIdAsync(reviewId);

            if (review is null)
            {
                return new BaseResponse<string?>(
                    "Review not found.",
                    HttpStatusCode.NotFound);
            }

            if (review.UserId != _currentUser.UserId)
            {
                return new BaseResponse<string?>(
                    "You are not authorized to update this review.",
                    HttpStatusCode.Forbidden);
            }

            review.Rating = dto.Rating;
            review.Comment = dto.Comment;

            _reviewRepository.Update(review);

            await UpdateStadiumRatingAsync(review.StadiumId, cancellationToken);

            await _reviewRepository.SaveChangeAsync();

            return new BaseResponse<string?>(
                null,
                "Review updated successfully.",
                HttpStatusCode.OK);
        }
        public async Task<BaseResponse<string?>> DeleteReviewAsync(
    Guid reviewId,
    CancellationToken cancellationToken)
        {
            var review = await _reviewRepository.GetByIdAsync(reviewId);

            if (review is null)
            {
                return new BaseResponse<string?>(
                    "Review not found.",
                    HttpStatusCode.NotFound);
            }

            var stadiumId = review.StadiumId;

            _reviewRepository.Delete(review);

            await UpdateStadiumRatingAsync(stadiumId, cancellationToken);

            await _reviewRepository.SaveChangeAsync();

            return new BaseResponse<string?>(
                null,
                "Review deleted successfully.",
                HttpStatusCode.OK);
        }
        public async Task<BaseResponse<string?>> DeleteMyReviewAsync(
    Guid reviewId,
    CancellationToken cancellationToken)
        {
            var review = await _reviewRepository.GetByIdAsync(reviewId);

            if (review is null)
            {
                return new BaseResponse<string?>(
                    "Review not found.",
                    HttpStatusCode.NotFound);
            }

            if (review.UserId != _currentUser.UserId)
            {
                return new BaseResponse<string?>(
                    "You are not authorized to delete this review.",
                    HttpStatusCode.Forbidden);
            }

            var stadiumId = review.StadiumId;

            _reviewRepository.Delete(review);

            await UpdateStadiumRatingAsync(stadiumId, cancellationToken);

            await _reviewRepository.SaveChangeAsync();

            return new BaseResponse<string?>(
                null,
                "Review deleted successfully.",
                HttpStatusCode.OK);
        }
        public async Task<BaseResponse<List<ReviewViewDto>>> GetAllByStadiumIdAsync(
    Guid stadiumId,
    CancellationToken cancellationToken)
        {
            var reviews = await _reviewRepository
                .GetByFiltered(
                    x => x.StadiumId == stadiumId,
                    include: new Expression<Func<Review, object>>[]
                    {
                x => x.User
                    })
                .OrderByDescending(x => x.CreatedAt)
                .Select(x => new ReviewViewDto
                {
                    Id = x.Id,
                    Rating = x.Rating,
                    Comment = x.Comment,
                    StadiumId = x.StadiumId,
                    UserId = x.UserId,
                    UserName = x.User.UserName!,
                    CreatedAt = x.CreatedAt
                })
                .ToListAsync(cancellationToken);

            return new BaseResponse<List<ReviewViewDto>>(
                reviews,
                "Reviews retrieved successfully.",
                HttpStatusCode.OK);
        }
        public async Task<BaseResponse<List<ReviewViewDto>>> GetByUserIdAsync(
    string userId,
    CancellationToken cancellationToken)
        {
            var reviews = await _reviewRepository
                .GetByFiltered(
                    x => x.UserId == userId,
                    include: new Expression<Func<Review, object>>[]
                    {
                x => x.User,
                x => x.Stadium
                    })
                .OrderByDescending(x => x.CreatedAt)
                .Select(x => new ReviewViewDto
                {
                    Id = x.Id,
                    Rating = x.Rating,
                    Comment = x.Comment,
                    StadiumId = x.StadiumId,
                    UserId = x.UserId,
                    UserName = x.User.UserName!,
                    CreatedAt = x.CreatedAt
                })
                .ToListAsync(cancellationToken);

            return new BaseResponse<List<ReviewViewDto>>(
                reviews,
                "Reviews retrieved successfully.",
                HttpStatusCode.OK);
        }
        private async Task UpdateStadiumRatingAsync(
    Guid stadiumId,
    CancellationToken cancellationToken)
        {
            var stadium = await _stadiumRepository.GetByIdAsync(stadiumId);

            if (stadium is null)
                return;

            var reviews = _reviewRepository
                .GetByFiltered(x => x.StadiumId == stadiumId);

            stadium.TotalReviews = await reviews.CountAsync(cancellationToken);

            stadium.AverageRating = stadium.TotalReviews == 0
                ? 0
                : await reviews.AverageAsync(x => (decimal)x.Rating, cancellationToken);

            _stadiumRepository.Update(stadium);
        }
    }
}
