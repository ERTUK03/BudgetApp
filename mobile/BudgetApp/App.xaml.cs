using BudgetApp.Pages;
using BudgetApp.Services;

namespace BudgetApp;

public partial class App : Application
{
    private readonly AuthService _auth;
    private readonly IServiceProvider _services;

    public App(AuthService auth, IServiceProvider services)
    {
        _auth = auth;
        _services = services;
    }

    protected override Window CreateWindow(IActivationState? activationState)
    {
        return new Window(new AppShell(_auth, _services));
    }
}
