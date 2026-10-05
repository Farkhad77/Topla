using Arenio.Application.Abstracts.Repositories;
using Arenio.Domain.Entities;
using Arenio.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace Arenio.Persistence.Repositories
{
    public class Repository<T> : IRepository<T> where T : BaseEntity, new()
    {
        private ArenioDbContext _context { get; }
        private DbSet<T> Table { get; }

        public Repository(ArenioDbContext context)
        {
            _context = context;
            Table = _context.Set<T>();

        }

        public async Task AddAsync(T entity)
        {
            entity.CreatedAt = DateTime.UtcNow;
            await Table.AddAsync(entity);
        }

        public void Update(T entity)
        {
            entity.UpdatedAt = DateTime.UtcNow;
            Table.Update(entity);
        }

        public void Delete(T entity)
        {
            Table.Remove(entity);
        }

        public async Task<T?> GetByIdAsync(Guid id)
        {
            return await Table.FindAsync(id);
        }

        public IQueryable<T> GetByFiltered(Expression<Func<T, bool>>? predicate = null,
            Expression<Func<T, object>>[]? include = null,
            bool isTracking = false)
        {
            IQueryable<T> query = Table;


            if (predicate != null)
            {
                query = query.Where(predicate);
            }

            if (include != null)
            {
                foreach (var includeExpression in include)
                {
                    query = query.Include(includeExpression);
                }
            }

            if (!isTracking)
            {
                query = query.AsNoTracking();
            }
            return query;
        }

        public IQueryable<T> GetAll(bool isTracking = false)
        {
            if (!isTracking)
                return Table.AsNoTracking();
            return Table;
        }

        public IQueryable<T> GetAllFiltered(Expression<Func<T, bool>>? predicate = null,
            Expression<Func<T, object>>[]? include = null,
            Expression<Func<T, bool>>? orderBy = null,
            bool isOrderByAsc = true,
            bool isTracking = false)
        {
            IQueryable<T> query = Table;
            if (predicate != null)
            {
                query = query.Where(predicate);
            }

            if (include != null)
            {
                foreach (var includeExpression in include)
                {
                    query = query.Include(includeExpression);
                }
            }

            if (orderBy != null)
            {
                query = isOrderByAsc ? query.OrderBy(orderBy) : query.OrderByDescending(orderBy);
            }

            if (!isTracking)
            {
                query = query.AsNoTracking();
            }
            return query;
        }

        public async Task SaveChangeAsync()
        {
            await _context.SaveChangesAsync();
        }

        public async Task<List<T>> GetByNameSearchAsync(string namePart, Expression<Func<T, string>> selector)
        {

            string propertyName = GetPropertyName(selector);

            return await Table
                .Where(e => EF.Functions.Like(EF.Property<string>(e, propertyName), $"%{namePart}%"))
                .ToListAsync();
        }
        private string GetPropertyName(Expression<Func<T, string>> expression)
        {
            if (expression.Body is MemberExpression member)
                return member.Member.Name;

            if (expression.Body is UnaryExpression unary && unary.Operand is MemberExpression memberOperand)
                return memberOperand.Member.Name;

            throw new InvalidOperationException("Invalid selector expression");
        }

    }
}
