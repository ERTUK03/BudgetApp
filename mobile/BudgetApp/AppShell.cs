using BudgetApp.Pages;
using BudgetApp.Services;

namespace BudgetApp;

public class AppShell : Shell
{
    private readonly AuthService _auth;
    private readonly IServiceProvider _services;

    public AppShell(AuthService auth, IServiceProvider services)
    {
        _auth = auth;
        _services = services;

        // Register routes
        Routing.RegisterRoute(nameof(LoginPage), typeof(LoginPage));
        Routing.RegisterRoute(nameof(RegisterPage), typeof(RegisterPage));
        Routing.RegisterRoute(nameof(DashboardPage), typeof(DashboardPage));
        Routing.RegisterRoute(nameof(TransactionsPage), typeof(TransactionsPage));
        Routing.RegisterRoute(nameof(AddTransactionPage), typeof(AddTransactionPage));

        InitializeAsync();
    }

    private async void InitializeAsync()
    {
        await _auth.InitializeAsync();

        if (_auth.IsLoggedIn)
            await GoToAsync($"//{nameof(DashboardPage)}");
        else
            await GoToAsync($"//{nameof(LoginPage)}");
    }
}
