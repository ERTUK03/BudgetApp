using System.Net.Http.Json;
using System.Text.Json;
using BudgetApp.Models;

namespace BudgetApp.Services;

public class ApiService
{
    private readonly HttpClient _http;
    private static readonly JsonSerializerOptions _json = new()
    {
        PropertyNameCaseInsensitive = true,
        PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower,
    };

    // Change this to your deployed backend URL
    public const string BaseUrl = "http://10.0.2.2:8000"; // Android emulator → localhost

    public ApiService(HttpClient http)
    {
        _http = http;
        _http.BaseAddress = new Uri(BaseUrl);
    }

    private void SetAuth(string? token)
    {
        _http.DefaultRequestHeaders.Remove("Authorization");
        if (!string.IsNullOrEmpty(token))
            _http.DefaultRequestHeaders.Add("Authorization", $"Bearer {token}");
    }

    // ── Auth ──────────────────────────────────────────────────────────────────

    public async Task<TokenDto?> LoginAsync(string email, string password)
    {
        var res = await _http.PostAsJsonAsync("/api/auth/login", new LoginRequest { Email = email, Password = password }, _json);
        res.EnsureSuccessStatusCode();
        return await res.Content.ReadFromJsonAsync<TokenDto>(_json);
    }

    public async Task<TokenDto?> RegisterAsync(string email, string username, string password)
    {
        var res = await _http.PostAsJsonAsync("/api/auth/register", new RegisterRequest { Email = email, Username = username, Password = password }, _json);
        res.EnsureSuccessStatusCode();
        return await res.Content.ReadFromJsonAsync<TokenDto>(_json);
    }

    // ── Transactions ──────────────────────────────────────────────────────────

    public async Task<TransactionListDto?> GetTransactionsAsync(string token, int page = 1, int month = 0, int year = 0)
    {
        SetAuth(token);
        var url = $"/api/transactions?page={page}&per_page=20";
        if (month > 0) url += $"&month={month}";
        if (year > 0) url += $"&year={year}";
        return await _http.GetFromJsonAsync<TransactionListDto>(url, _json);
    }

    public async Task<TransactionDto?> CreateTransactionAsync(string token, TransactionCreateDto data)
    {
        SetAuth(token);
        var res = await _http.PostAsJsonAsync("/api/transactions", data, _json);
        res.EnsureSuccessStatusCode();
        return await res.Content.ReadFromJsonAsync<TransactionDto>(_json);
    }

    public async Task DeleteTransactionAsync(string token, int id)
    {
        SetAuth(token);
        var res = await _http.DeleteAsync($"/api/transactions/{id}");
        res.EnsureSuccessStatusCode();
    }

    public async Task<MonthlySummaryDto?> GetSummaryAsync(string token, int month, int year)
    {
        SetAuth(token);
        return await _http.GetFromJsonAsync<MonthlySummaryDto>(
            $"/api/transactions/summary/monthly?month={month}&year={year}", _json);
    }

    // ── Categories ────────────────────────────────────────────────────────────

    public async Task<List<CategoryDto>?> GetCategoriesAsync(string token)
    {
        SetAuth(token);
        return await _http.GetFromJsonAsync<List<CategoryDto>>("/api/categories", _json);
    }
}
