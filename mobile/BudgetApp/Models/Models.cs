using SQLite;

namespace BudgetApp.Models;

// ── API DTOs (mirror backend schemas) ─────────────────────────────────────────

public class UserDto
{
    public int Id { get; set; }
    public string Email { get; set; } = "";
    public string Username { get; set; } = "";
}

public class TokenDto
{
    public string AccessToken { get; set; } = "";
    public string TokenType { get; set; } = "";
    public UserDto User { get; set; } = new();
}

public class LoginRequest
{
    public string Email { get; set; } = "";
    public string Password { get; set; } = "";
}

public class RegisterRequest
{
    public string Email { get; set; } = "";
    public string Username { get; set; } = "";
    public string Password { get; set; } = "";
}

public class CategoryDto
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string Icon { get; set; } = "💰";
    public string Color { get; set; } = "#3b82f6";
    public string Type { get; set; } = "expense"; // income | expense
}

public class TransactionDto
{
    public int Id { get; set; }
    public string Title { get; set; } = "";
    public decimal Amount { get; set; }
    public string Type { get; set; } = "expense";
    public string Note { get; set; } = "";
    public DateTime Date { get; set; }
    public int? CategoryId { get; set; }
    public CategoryDto? Category { get; set; }
}

public class TransactionCreateDto
{
    public string Title { get; set; } = "";
    public decimal Amount { get; set; }
    public string Type { get; set; } = "expense";
    public string Note { get; set; } = "";
    public DateTime Date { get; set; }
    public int? CategoryId { get; set; }
}

public class TransactionListDto
{
    public List<TransactionDto> Items { get; set; } = new();
    public int Total { get; set; }
    public int Page { get; set; }
    public int Pages { get; set; }
}

public class MonthlySummaryDto
{
    public int Month { get; set; }
    public int Year { get; set; }
    public decimal TotalIncome { get; set; }
    public decimal TotalExpense { get; set; }
    public decimal Balance { get; set; }
}

// ── Local SQLite cache ─────────────────────────────────────────────────────────

[Table("transactions_cache")]
public class TransactionCache
{
    [PrimaryKey, AutoIncrement] public int LocalId { get; set; }
    public int RemoteId { get; set; }
    public string Title { get; set; } = "";
    public decimal Amount { get; set; }
    public string Type { get; set; } = "expense";
    public string Note { get; set; } = "";
    public DateTime Date { get; set; }
    public int? CategoryId { get; set; }
    public string CategoryName { get; set; } = "";
    public string CategoryIcon { get; set; } = "";
    public DateTime CachedAt { get; set; }
    public bool PendingSync { get; set; } = false;
}
