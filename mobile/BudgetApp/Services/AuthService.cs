using BudgetApp.Models;

namespace BudgetApp.Services;

public class AuthService
{
    private readonly ApiService _api;
    private const string TokenKey = "auth_token";
    private const string UserKey = "auth_user";

    public string? Token { get; private set; }
    public UserDto? CurrentUser { get; private set; }
    public bool IsLoggedIn => !string.IsNullOrEmpty(Token);

    public AuthService(ApiService api)
    {
        _api = api;
    }

    public async Task InitializeAsync()
    {
        try
        {
            Token = await SecureStorage.GetAsync(TokenKey);
            var userJson = await SecureStorage.GetAsync(UserKey);
            if (userJson is not null)
                CurrentUser = System.Text.Json.JsonSerializer.Deserialize<UserDto>(userJson);
        }
        catch { /* SecureStorage may fail on some devices/emulators */ }
    }

    public async Task<bool> LoginAsync(string email, string password)
    {
        var result = await _api.LoginAsync(email, password);
        if (result is null) return false;
        await PersistAsync(result);
        return true;
    }

    public async Task<bool> RegisterAsync(string email, string username, string password)
    {
        var result = await _api.RegisterAsync(email, username, password);
        if (result is null) return false;
        await PersistAsync(result);
        return true;
    }

    private async Task PersistAsync(TokenDto data)
    {
        Token = data.AccessToken;
        CurrentUser = data.User;
        await SecureStorage.SetAsync(TokenKey, data.AccessToken);
        await SecureStorage.SetAsync(UserKey, System.Text.Json.JsonSerializer.Serialize(data.User));
    }

    public void Logout()
    {
        Token = null;
        CurrentUser = null;
        SecureStorage.Remove(TokenKey);
        SecureStorage.Remove(UserKey);
    }
}
