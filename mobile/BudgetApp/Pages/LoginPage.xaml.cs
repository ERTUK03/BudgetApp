using BudgetApp.Services;

namespace BudgetApp.Pages;

public partial class LoginPage : ContentPage
{
    private readonly AuthService _auth;

    public LoginPage(AuthService auth)
    {
        InitializeComponent();
        _auth = auth;
    }

    private async void OnLogin(object sender, EventArgs e)
    {
        ErrorLabel.IsVisible = false;
        LoginBtn.IsEnabled = false;
        LoginBtn.Text = "Logowanie…";

        try
        {
            var ok = await _auth.LoginAsync(EmailEntry.Text?.Trim() ?? "", PasswordEntry.Text ?? "");
            if (ok)
                await Shell.Current.GoToAsync($"//{nameof(DashboardPage)}");
            else
            {
                ErrorLabel.Text = "Nieprawidłowy e-mail lub hasło";
                ErrorLabel.IsVisible = true;
            }
        }
        catch (Exception ex)
        {
            ErrorLabel.Text = ex.Message;
            ErrorLabel.IsVisible = true;
        }
        finally
        {
            LoginBtn.IsEnabled = true;
            LoginBtn.Text = "Zaloguj się";
        }
    }

    private async void OnRegister(object sender, TappedEventArgs e)
        => await Shell.Current.GoToAsync(nameof(RegisterPage));
}
