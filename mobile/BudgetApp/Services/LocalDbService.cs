using SQLite;
using BudgetApp.Models;

namespace BudgetApp.Services;

public class LocalDbService
{
    private SQLiteAsyncConnection? _db;

    private async Task<SQLiteAsyncConnection> GetDb()
    {
        if (_db is not null) return _db;
        var path = Path.Combine(FileSystem.AppDataDirectory, "budgetapp.db");
        _db = new SQLiteAsyncConnection(path, SQLiteOpenFlags.ReadWrite | SQLiteOpenFlags.Create | SQLiteOpenFlags.SharedCache);
        await _db.CreateTableAsync<TransactionCache>();
        return _db;
    }

    public async Task CacheTransactionsAsync(IEnumerable<TransactionDto> transactions)
    {
        var db = await GetDb();
        foreach (var t in transactions)
        {
            var existing = await db.Table<TransactionCache>().Where(c => c.RemoteId == t.Id).FirstOrDefaultAsync();
            if (existing is not null) { await db.DeleteAsync(existing); }

            await db.InsertAsync(new TransactionCache
            {
                RemoteId = t.Id,
                Title = t.Title,
                Amount = t.Amount,
                Type = t.Type,
                Note = t.Note,
                Date = t.Date,
                CategoryId = t.CategoryId,
                CategoryName = t.Category?.Name ?? "",
                CategoryIcon = t.Category?.Icon ?? "",
                CachedAt = DateTime.UtcNow,
                PendingSync = false,
            });
        }
    }

    public async Task<List<TransactionCache>> GetCachedTransactionsAsync()
    {
        var db = await GetDb();
        return await db.Table<TransactionCache>()
            .OrderByDescending(t => t.Date)
            .ToListAsync();
    }

    public async Task AddPendingTransactionAsync(TransactionCreateDto data)
    {
        var db = await GetDb();
        await db.InsertAsync(new TransactionCache
        {
            RemoteId = -1, // not yet synced
            Title = data.Title,
            Amount = data.Amount,
            Type = data.Type,
            Note = data.Note,
            Date = data.Date,
            CategoryId = data.CategoryId,
            CachedAt = DateTime.UtcNow,
            PendingSync = true,
        });
    }

    public async Task<List<TransactionCache>> GetPendingAsync()
    {
        var db = await GetDb();
        return await db.Table<TransactionCache>().Where(t => t.PendingSync).ToListAsync();
    }

    public async Task MarkSyncedAsync(int localId)
    {
        var db = await GetDb();
        await db.ExecuteAsync("DELETE FROM transactions_cache WHERE LocalId = ?", localId);
    }

    public async Task ClearCacheAsync()
    {
        var db = await GetDb();
        await db.DeleteAllAsync<TransactionCache>();
    }
}
