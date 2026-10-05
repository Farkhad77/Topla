using Arenio.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace Arenio.Application.Abstracts.Repositories
{
    public interface IRepository<T> where T : BaseEntity, new()
    {
        Task<T?> GetByIdAsync(Guid id);
        IQueryable<T> GetByFiltered(Expression<Func<T, bool>>? predicate = null,
            Expression<Func<T, object>>[]? include = null,
            bool isTracking = false);
        IQueryable<T> GetAll(bool isTracking = false);

        IQueryable<T> GetAllFiltered(Expression<Func<T, bool>>? predicate = null,
            Expression<Func<T, object>>[]? include = null,
            Expression<Func<T, bool>>? orderBy = null,
            bool isOrderByAsc = true,
            bool isTracking = false);
        Task SaveChangeAsync();
        Task AddAsync(T entity);
        Task<List<T>> GetByNameSearchAsync(string namePart, Expression<Func<T, string>> selector);
        void Update(T entity);
        void Delete(T entity);

    }
}
